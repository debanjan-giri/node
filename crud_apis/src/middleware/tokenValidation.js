import jwt from "jsonwebtoken";
import { errResponse } from "../utils/common.js";
import authModel from "../models/authModel.js";

export const tokenValidation = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for Bearer token in the Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errResponse(next, "Authorization Bearer token missing", 401);
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    // Verify token and check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        const message =
          err.name === "TokenExpiredError"
            ? "Token has expired"
            : "Token is invalid";
        return errResponse(next, message, 401);
      }

      // Extract user ID from the decoded token
      const userId = decoded.id;
      if (!userId) {
        return errResponse(next, "Token does not contain a valid user ID", 401);
      }

      // Check if user exists in the database
      const user = await authModel.findById(userId).select("_id mobile");
      if (!user) {
        return errResponse(next, "User not found in database", 404);
      }

      // Attach user data to request for further use
      req.Token = { id: user._id, mobile: user.mobile };
      next();
    });
  } catch (error) {
    next(error);
  }
};
