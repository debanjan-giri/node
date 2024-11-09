import jwt from "jsonwebtoken";

import userModel from "../model/userModel.js";
import orderModel from "../model/orderModel.js";
import { comparePass, hashPass } from "../helpers/authHelper.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    if (!name || !email || !password || !phone || !address || !answer) {
      return res.status(400).send({
        success: false,
        messege: "Please enter all fields",
      });
    }

    const userExists = await userModel.findOne({ email: email });
    if (userExists) {
      return res.status(200).send({
        success: true,
        messege: "User already exists",
      });
    }

    const hashedPassword = await hashPass(password);
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      answer,
    });
    res.status(200).send({
      success: true,
      messege: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messege: "registerController error",
      error: error,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        messege: "invalid credentials",
      });
    }

    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(200).send({
        success: false,
        messege: "User not found",
      });
    }

    const validPass = await comparePass(password, user.password);
    if (!validPass) {
      return res.status(200).send({
        success: false,
        messege: "invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      messege: "User logged in successfully",
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messege: "loginController error",
      error,
    });
  }
};

export const forgotPassController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email || !answer || !newPassword) {
      return res.status(400).send({
        success: false,
        messege: "Please enter all fields",
      });
    }

    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(404).send({
        success: false,
        messege: "User not found",
      });
    }

    const hashed = await hashPass(newPassword);
    await userModel.findByIdAndUpdate(user._id, {
      password: hashed,
    });
    res.status(200).send({
      success: true,
      messege: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      messege: "forgotPassController error",
      error,
    });
    {
    }
  }
};

export const testController = (req, res) => {
  res.send({
    messege: "protected",
  });
};
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.decodeData.id);
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }

    const hashedPassword = password ? await hashPass(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.decodeData.id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {}
};

export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.decodeData.id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};
