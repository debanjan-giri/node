import { Router } from "express";
import {
  createController,
  deleteController,
  readAllController,
  updateController,
} from "../controllers/crudController.js";
import { tokenValidation } from "../middleware/tokenValidation.js";

const crudRoute = Router();

crudRoute.post("/create", tokenValidation, createController);
crudRoute.put("/update/:id", tokenValidation, updateController);
crudRoute.delete("/delete/:id", tokenValidation, deleteController);
//?page=1&limit=2
crudRoute.get("/read/all", tokenValidation, readAllController); 

export default crudRoute;
