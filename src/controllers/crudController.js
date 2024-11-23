import crudModel from "../models/crudModel.js";
import { errResponse, okResponse, validateId } from "../utils/common.js";
import authModel from "../models/authModel.js";

import { detailsValidation } from "../validation/inputValidation.js";

export const createController = async (req, res, next) => {
  try {
    // get user id from the token
    const { id: userId } = req.Token;

    // Validate request data
    const { error, value } = detailsValidation.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });
    if (error) return errResponse(next, error?.details[0]?.message, 400);

    // Extract validated data
    const { name, email, address } = value;

    // Create new data entry in the crud collection
    const newData = await crudModel.create({
      name,
      email,
      address,
    });

    // if data is not created
    if (!newData) return errResponse(next, "Data creation failed", 500);

    // Update the auth document by pushing the newData._id to crudIdArray
    const updatedUser = await authModel.findByIdAndUpdate(
      userId,
      { $push: { crudIdArray: newData._id } },
      { new: true }
    );

    if (!updatedUser) {
      // Rollback the creation if the user update fails
      await crudModel.findByIdAndDelete(newData._id);
      return errResponse(next, "Data creation and linking failed  ", 500);
    }

    // return success response
    return okResponse(res, "Data created and linked successfully", {
      name: newData.name,
      email: newData.email,
      address: newData.address,
    });
  } catch (error) {
    console.error("Error in createController", error.message);
    next(error);
  }
};

export const readAllController = async (req, res, next) => {
  try {
    // Extract the user ID and pagination parameters from the query
    const { id: userId } = req.Token;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Retrieve the user document and ensure the user exists
    const user = await authModel.findById(userId).select("crudIdArray").lean();

    if (!user) {
      return errResponse(next, "User not found", 404);
    }

    // Retrieve the CRUD data using pagination
    const crudData = await crudModel
      .find({ _id: { $in: user.crudIdArray } })
      .skip(skip)
      .limit(limit)
      .lean();

    if (crudData.length === 0) {
      return errResponse(next, "No data found for this user", 404);
    }

    // Get total count for pagination metadata
    const totalCount = await crudModel.countDocuments({
      _id: { $in: user.crudIdArray },
    });

    // Return the paginated response with pagination metadata
    return okResponse(res, "Data retrieved successfully", {
      data: crudData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error(`Error in readAllController: ${error.message}`);
    return next(error);
  }
};

export const updateController = async (req, res, next) => {
  try {
    const { id: userId } = req.Token;
    const { id } = req.params;

    // Validate id parameter
    const validId = validateId(id, next);
    if (!validId) return;

    // Validate request data
    const { error, value } = detailsValidation.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });
    if (error) {
      return errResponse(next, error?.details[0]?.message, 400);
    }

    // Extract validated data
    const { name, email, address } = value;

    // Find the record to be updated in the CRUD collection
    const existingData = await crudModel.findById(id).lean();

    if (!existingData) {
      await authModel.updateOne(
        { _id: userId },
        { $pull: { crudIdArray: id } }
      );
      return errResponse(next, "id not found", 404);
    }

    // Find the user who owns the data
    const user = await authModel
      .findOne({ _id: userId, crudIdArray: id })
      .lean();

    if (!user) {
      return errResponse(next, "Data not found in user's collection", 404);
    }

    // Update the data in the CRUD collection
    const updatedData = await crudModel
      .findByIdAndUpdate(
        id,
        { name, email, address },
        { new: true } // Return the updated document
      )
      .lean();

    if (!updatedData) {
      return errResponse(next, "Failed to update data", 500);
    }

    // Return success response
    return okResponse(res, "Data updated successfully", updatedData);
  } catch (error) {
    console.error(`Error in updateController: ${error.message}`);
    next(error);
  }
};

export const deleteController = async (req, res, next) => {
  try {
    const { id: userId } = req.Token;
    const { id } = req.params;

    // Check if the user owns the data
    const user = await authModel
      .findOne({ _id: userId, crudIdArray: id })
      .lean();

    if (!user) {
      return errResponse(next, "Data not found in user's collection", 404);
    }

    // Find the record to be deleted in the CRUD collection
    const existingData = await crudModel.findById(id).lean();

    if (!existingData) {
      await authModel.updateOne(
        { _id: userId },
        { $pull: { crudIdArray: id } }
      );
      return errResponse(next, "Data not found", 404);
    }

    // Delete the data from the CRUD collection
    const deletedData = await crudModel.findByIdAndDelete(id).lean();

    if (!deletedData) {
      return errResponse(next, "Failed to delete data", 500);
    }

    //  remove the deleted data's ID from the user
    await authModel.updateOne({ _id: userId }, { $pull: { crudIdArray: id } });

    // Return success response
    return okResponse(res, "Data deleted successfully", {
      message:
        "The data has been deleted and removed from the user's associated list.",
    });
  } catch (error) {
    console.error(`Error in deleteController: ${error.message}`);
    next(error);
  }
};
