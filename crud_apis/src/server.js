import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import connect from "./config/connetDB.js";
import authRoute from "./routes/authRoute.js";
import errorHandler from "./middleware/errorHandler.js";
import { okResponse } from "./utils/common.js";
import crudRoute from "./routes/crudRoute.js";

// express app
const app = express(); // create express app
dotenv.config(); // load env variables
connect(); // connect to db

// middleware
app.use(helmet());
app.use(cors()); // enable cors
app.use(express.json()); // parse request body as json

// routes
app.use("/auth", authRoute); // prefix routes
app.use("/crud", crudRoute); // prefix routes


// error handler
app.use(errorHandler);

// 404
app.use("*", (req, res) => {
  return okResponse(res, "Route not found");
});

// port
const PORT = process.env.PORT || 3000;

// server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} ✅`);
});
