import { Schema, model } from "mongoose";

const crudSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,

  },
  email: {
    type: String,
    required: true,
    trim: true,

  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
});

// create model
const crudModel = model("crud", crudSchema);

export default crudModel;
