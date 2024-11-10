import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// password related functions
export const createHash = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// response related functions
export const errResponse = (
  next,
  message = "Something went wrong",
  statusCode = 203
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.clientError = true; // to differentiate between server and client errors
  next(error);
};

export const okResponse = (res, message = "", responseData = {}) => {
  return res.status(200).json({
    success: true,
    message: message,
    data: responseData,
  });
};

// token related functions
const createToken = (next, user, secretKey, expiry) => {
  try {
    const { id } = user;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new Error("Valid User ID is required for token generation"));
    }

    if (!secretKey || !expiry) {
      return next(new Error("Token secret and expiry are required"));
    }
    const token = jwt.sign({ id }, secretKey, { expiresIn: expiry });
    return token;
  } catch (error) {
    return next(new Error(`Token generation failed: ${error.message}`));
  }
};

export const generateAccessToken = (next, user) => {
  return createToken(
    next,
    user,
    process.env.ACCESS_TOKEN_SECRET,
    process.env.ACCESS_TOKEN_EXPIRY
  );
};

export const generateRefreshToken = (res, next, user) => {
  try {
    const refreshtoken = createToken(
      next,
      user,
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_EXPIRY
    );
    res.cookie("refreshToken", refreshtoken, {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return refreshtoken;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    return next(error);
  }
};

export const validateId = (id, next) => {
  if (!id || typeof id !== "string") {
    return errResponse(next, "ID must be a non-empty string", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return errResponse(next, "Invalid ID format", 400);
  }
  return id;
};
