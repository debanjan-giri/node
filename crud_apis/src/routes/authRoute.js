import { Router } from "express";
import {
  loginController,
  registerController,
} from "../controllers/authController.js";

const authRoute = Router();
authRoute.post("/register", registerController);
authRoute.post("/login", loginController);

export default authRoute;
