import { NextFunction, Request, Response } from "express";
import Ingredient from "../models/ingredientModel";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";
import { catchAsync } from "../utils/catchAsync";

export const getAllIngredients = getAll(Ingredient);
export const getIngredient = getOne(Ingredient);
export const createIngredient = createOne(Ingredient);
export const deleteIngredient = deleteOne(Ingredient);
export const updateIngredient = updateOne(Ingredient);

export const getIngredientByName = () =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { name } = req.params;

    const names = name.split(" ").filter(Boolean);

    const regexConditions = names.map((s) => new RegExp(s, "i")); // Create regex patterns for each slug
    const query = { name: { $in: regexConditions } };

    const data = await Ingredient.find(query);

    res.status(200).json({
      status: "success",
      result: data.length,
      data,
    });
  });
