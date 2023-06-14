import { NextFunction, Request, Response } from "express";
import Comment from "../models/commentModel";
import { catchAsync } from "../utils/catchAsync";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";
import AppError from "../utils/appErrors";

export const getCommentByRecipeId = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = await Comment.find({ receipt: req.params.id });

    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data,
    });
  });

export const getAllComments = getAll(Comment);
export const getComment = getOne(Comment);
export const createComment = createOne(Comment);
export const deleteComment = deleteOne(Comment);
export const updateComment = updateOne(Comment);
