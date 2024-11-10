import { Router } from "express";
import {
  loginController,
  refreshTokenController,
  registerController,
} from "../controllers/authController.js";

const authRoute = Router();
authRoute.post("/register", registerController);
authRoute.post("/login", loginController);
authRoute.post("/refresh-token", refreshTokenController);

export default authRoute;
