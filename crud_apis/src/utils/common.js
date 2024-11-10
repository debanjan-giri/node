import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

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

export const createHash = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const generateToken = (user) => {
  const { id } = user;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Valid User ID is required for token generation");
  }

  if (!process.env.JWT_SECRET && !process.env.JWT_EXPIRY) {
    throw new Error("JWT_SECRET and JWT_EXPIRY is not defined");
  }
  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });
    return token;
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
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
