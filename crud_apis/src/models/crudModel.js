import { Schema, model } from "mongoose";

const crudSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

// create model
const crudModel = model("crud", crudSchema);

export default crudModel;
