import Ingredient from "../models/ingredientModel";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";

export const getAllIngredients = getAll(Ingredient);
export const getIngredient = getOne(Ingredient);
export const createIngredient = createOne(Ingredient);
export const deleteIngredient = deleteOne(Ingredient);
export const updateIngredient = updateOne(Ingredient);
