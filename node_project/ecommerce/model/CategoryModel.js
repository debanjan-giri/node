import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    loercase: true,
  },
});

const CategoryModel = mongoose.model("Category", CategorySchema);

export default CategoryModel;
