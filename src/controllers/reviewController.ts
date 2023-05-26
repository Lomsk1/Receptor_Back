import { NextFunction, Request, Response } from "express";
import Review from "../models/reviewModel";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";

export const setRecipeUserIds = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Allow nested routes
  if (!req.body.receipt) req.body.receipt = req.params.receiptId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export const getAllReview = getAll(Review);
export const getReview = getOne(Review);
export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);
