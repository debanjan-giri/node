import { Router } from "express";
import {
  createController,
  deleteController,
  readAllController,
  updateController,
} from "../controllers/crudController.js";
import { accessTokenValidation } from "../middleware/accessTokenValidation.js";

const crudRoute = Router();

crudRoute.post("/create", accessTokenValidation, createController);
crudRoute.put("/update/:id", accessTokenValidation, updateController);
crudRoute.delete("/delete/:id", accessTokenValidation, deleteController);
//?page=1&limit=2
crudRoute.get("/read/all", accessTokenValidation, readAllController); 

export default crudRoute;
