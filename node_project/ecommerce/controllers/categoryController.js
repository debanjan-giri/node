import CategoryModel from "../model/CategoryModel.js";
import slugify from "slugify";

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "name is required",
      });
    }

    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: false,
        message: "category already exists",
      });
    }

    const saveCategory = await CategoryModel.create({
      name,
      slug: slugify(name),
    });
    res.status(200).send({
      success: true,
      message: "category created successfully",
      data: saveCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "create category error",
      error: error,
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const category = await CategoryModel.findByIdAndUpdate(
      id,
      {
        name,
        slug: slugify(name),
      },
      {
        new: true,
      }
    );

    res.status(200).send({
      success: true,
      message: "category updated successfully",
      data: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "update category error",
      error: error,
    });
  }
};

export const readCategoryController = async (req, res) => {
  try {
    const category = await CategoryModel.find({});
    res.status(200).send({
      success: true,
      category,
      message: "category read successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "read category error",
      error,
    });
  }
};

export const singleCategoryController = async (req, res) => {
  try {
    const category = await CategoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      category,
      message: "single category read successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "single category error",
      error: error,
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    await CategoryModel.findByIdAndDelete(req.params.id);
    res.status(200).send({
      success: true,
      message: "category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "delete category error",
      error: error,
    });
  }
};
