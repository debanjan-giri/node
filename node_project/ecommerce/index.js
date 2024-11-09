import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import productsRoute from "./routes/productRoute.js";

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// server
// app.use(express.static(path.join(__dirname, "./client/dist")));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/product", productsRoute);

// server
// app.use("*", function (req, res) {
//   res.sendFile(path.join(__dirname, "./client/dist/index.html"));
// });

const port_Number = process.env.PORT || 6060;

app.listen(port_Number, () => {
  console.log(`${process.env.DEV_MODE} ${port_Number}`);
});
