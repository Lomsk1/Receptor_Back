import { NextFunction, Request, Response } from "express";
import RecipeFavorite from "../models/recipeFavoriteModel";
import { catchAsync } from "../utils/catchAsync";
import {
  createOne,
  deleteOne,
  deleteRecipeFavoriteByUser,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";
import AppError from "../utils/appErrors";

export const deleteRecipeFavByUser = deleteRecipeFavoriteByUser(RecipeFavorite);

export const getAllRecipeFavorite = getAll(RecipeFavorite);
export const getRecipeFavorite = getOne(RecipeFavorite);
export const createRecipeFavorite = createOne(RecipeFavorite);
export const updateRecipeFavorite = updateOne(RecipeFavorite);
export const deleteRecipeFavorite = deleteOne(RecipeFavorite);

export const getRecipeFavoriteByUser = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = await RecipeFavorite.find({ user: req.params.userID });
    await Promise.all(
      data.map(async (document) => {
        await document.recipePopulate();
      })
    );
    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data,
    });
  });
