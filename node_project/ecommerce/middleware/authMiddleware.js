import jwt from "jsonwebtoken";

import userModel from "../model/userModel.js";

export const requireSignIn = async (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.decodeData = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.decodeData.id);

    if (user.role !== 1) {
      return res.status(200).send({
        success: false,
        messege: "You are not admin",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messege: "isAdmin error",
      error,
    });
  }
};
