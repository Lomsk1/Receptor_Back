import IngredientCategory from "../models/ingredientCategory";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";

export const getAllIngredientCategory = getAll(IngredientCategory);
export const getIngredientCategory = getOne(IngredientCategory);
export const createIngredientCategory = createOne(IngredientCategory);
export const deleteIngredientCategory = deleteOne(IngredientCategory);
export const updateIngredientCategory = updateOne(IngredientCategory);
