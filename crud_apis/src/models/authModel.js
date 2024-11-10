import { Schema, model } from "mongoose";

const authSchema = new Schema(
  {
    mobile: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      // index: true, // Index for faster querying
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false, // Exclude password from query results by default
    },
    crudIdArray: [{ type: Schema.Types.ObjectId, ref: "crud" }],
  },
  {
    timestamps: true,
  }
);

// create model
const authModel = model("auth", authSchema);

export default authModel;
