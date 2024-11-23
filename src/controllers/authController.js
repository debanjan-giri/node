import authModel from "../models/authModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authValidation } from "../validation/inputValidation.js";

import {
  errResponse,
  generateAccessToken,
  okResponse,
  generateRefreshToken,
} from "../utils/common.js";
import { createHash } from "../utils/common.js";

export const registerController = async (req, res, next) => {
  try {
    // Validate request data
    const { error, value } = authValidation.validate(req.body, {
      abortEarly: false, // Capture all validation errors
      allowUnknown: false, // Prevent any unexpected fields in the request
    });
    if (error) return errResponse(next, error?.details[0]?.message, 400);

    const { mobile, password } = value;

    // Check if user already exists
    const existingUser = await authModel.findOne({ mobile }).select("_id");
    if (existingUser) return errResponse(next, "User already exists", 409);

    // Hash password
    const hashedPassword = await createHash(password);

    // Create new user
    const newUser = await authModel.create({
      mobile,
      password: hashedPassword,
    });
    if (!newUser) return errResponse(next, "User registration failed", 500);

    // Generate JWT token
    const accesstoken = generateAccessToken(next, newUser);

    // send refresh token in cookie
    const refreshtoken = generateRefreshToken(res, next, newUser);

    if (!accesstoken && !refreshtoken) {
      await authModel.deleteOne({ _id: newUser._id });
      return errResponse(next, "User registration failed", 500);
    }

    // Success response
    return okResponse(res, "User registered successfully", {
      id: newUser._id,
      mobile: newUser.mobile,
      token: accesstoken,
    });
  } catch (error) {
    console.error(`Error in registerController : ${error.message}`);
    next(error); // Pass errors to global error handler
  }
};

export const loginController = async (req, res, next) => {
  try {
    // Validate request data
    const { error, value } = authValidation.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) return errResponse(next, error?.details[0]?.message, 400);

    const { mobile, password } = value;

    // Check if user exists
    const user = await authModel.findOne({ mobile }).select("+password");
    if (!user)
      return errResponse(next, "Invalid mobile number or password", 401);

    // Compare the hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return errResponse(next, "Invalid mobile number or password", 401);

    // Generate JWT token
    const accesstoken = generateAccessToken(next, newUser);

    // send refresh token in cookie
    const refreshtoken = generateRefreshToken(res, next, newUser);

    if (!accesstoken && !refreshtoken) {
      await authModel.deleteOne({ _id: newUser._id });
      return errResponse(next, "User login failed", 500);
    }

    // Return success response
    return okResponse(res, "Login successful", {
      id: user._id,
      mobile: user.mobile,
      token: accesstoken,
    });
  } catch (error) {
    console.error(`Error in loginController : ${error.message}`);
    next(error);
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return errResponse(next, "Refresh token not found", 401);
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
      return next(new Error("REFRESH_TOKEN_SECRET is not defined"));
    }

    // Verify the refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          const message =
            err.name === "TokenExpiredError"
              ? "Refresh token has expired"
              : "Invalid refresh token";
          return errResponse(next, message, 403); // Forbidden
        }

        if (!decoded.id) {
          return errResponse(next, "Invalid refresh token", 401);
        }

        // Find the user in the database
        const user = await authModel.findById(decoded.id).select("_id");
        if (!user) {
          return errResponse(next, "User not found in database", 404);
        }

        // Generate JWT token
        const accesstoken = generateAccessToken(next, newUser);

        // send refresh token in cookie
        const refreshtoken = generateRefreshToken(res, next, newUser);

        if (!accesstoken && !refreshtoken) {
          await authModel.deleteOne({ _id: newUser._id });
          return errResponse(next, "User not found ", 500);
        }

        // Send the new access token in the response body
        res.json({ token: accesstoken });
      }
    );
  } catch (error) {
    console.error(`Error in refreshTokenController : ${error.message}`);
    next(error); // Pass errors to the global error handler
  }
};
