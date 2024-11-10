import Joi from "joi";
import authModel from "../models/authModel.js";
import bcrypt from "bcrypt";
import { errResponse, generateToken, okResponse } from "../utils/common.js";
import { createHash } from "../utils/common.js";
const authValidation = Joi.object({
  mobile: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.base": "Mobile must be a string",
      "string.empty": "Mobile cannot be empty",
      "string.length": "Mobile should be 10 digits long",
      "string.pattern.base": "Mobile must contain only numbers",
      "any.required": "Mobile is required",
    }),
  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
});

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
    const token = generateToken(newUser);

    // Success response
    return okResponse(res, "User registered successfully", {
      id: newUser._id,
      mobile: newUser.mobile,
      token,
    });
  } catch (error) {
    console.error("Error in registerController"); 
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
    const token = generateToken(user);

    // Return success response
    return okResponse(res, "Login successful", {
      id: user._id,
      mobile: user.mobile,
      token,
    });
  } catch (error) {
    console.error("Error in loginController");
    next(error);
  }
};
