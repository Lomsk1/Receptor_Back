import { Document } from "mongodb";
import { Model } from "mongoose";
import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import APIFeatures from "../utils/apiFeatures";
import AppError from "../utils/appErrors";
import cloudinary from "../utils/cloudinary";
import { join } from "path";
import { promises as fsPromises } from "fs";

export const getAllByFilter = (Model: Model<Document>) =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.body;

    const data = await Model.find({ ingredients: { $in: id } });

    res.status(200).json({
      status: "success",
      result: data.length,
      data,
    });
  });

export const deleteCommentLikeByUser = (Model: Model<Document>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userID, commentID } = req.params;

    const data = await Model.findOneAndDelete(
      {
        user: userID,
        comment: commentID,
      },
      { new: false }
    );
    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: null,
    });
  });

export const deleteRecipeFavoriteByUser = (Model: Model<Document>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userID, recipeID } = req.params;

    const data = await Model.findOneAndDelete(
      {
        user: userID,
        recipe: recipeID,
      },
      { new: false }
    );
    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: null,
    });
  });

// Default

export const getAll = (Model: Model<Document>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let filter = {};
    if (req.params.receiptId) filter = { receipt: req.params.receiptID };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.query;
    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      result: data.length,
      data,
    });
  });

export const getOne = (
  Model: Model<Document>,
  popOptions?: string | { path: string; select?: string }
) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query: any = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const data = await query;

    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data,
    });
  });

export const createOne = (Model: Model<Document>) =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    let createdData = req.body;

    if (req.file) {
      const tempDirPath = join(__dirname, "tempRep");
      const tempFilePath = join(tempDirPath, req.file.originalname);
      // Create the temp directory if it doesn't exist
      await fsPromises.mkdir(tempDirPath, { recursive: true });

      // Create a temporary file with the buffer content
      await fsPromises.writeFile(tempFilePath, req.file.buffer);

      const cloudUpload = await cloudinary.uploader.upload(tempFilePath, {
        folder: `Receipt/Recipe`,
      });

      if (createdData.image && createdData.image.public_id) {
        await cloudinary.uploader.destroy(createdData.image.public_id);
      }
      createdData.image = {
        public_id: cloudUpload.public_id,
        url: cloudUpload.secure_url,
      };

      // Remove the temporary file after uploading to Cloudinary
      await fsPromises.unlink(tempFilePath);
    }
    const data = await Model.create(createdData);

    res.status(201).json({
      status: "success",
      data,
    });
  });

export const updateOne = (Model: Model<Document>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let updatedData = req.body;

    const data = await Model.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data,
    });
  });

export const deleteOne = (Model: Model<Document>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = await Model.findByIdAndDelete(req.params.id);

    if (!data) {
      return next(new AppError("No Document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
