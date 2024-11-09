import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPassController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";

const authRoute = express.Router();

authRoute.post("/register", registerController);
authRoute.post("/login", loginController);
authRoute.post("/forgot-password", forgotPassController);
authRoute.get("/test", requireSignIn, isAdmin, testController);
authRoute.put("/profile", requireSignIn, updateProfileController);
authRoute.get("/orders", requireSignIn, getOrdersController);
authRoute.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);
authRoute.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);
authRoute.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({
    ok: true,
  });
});

authRoute.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({
    ok: true,
  });
});

export default authRoute;
