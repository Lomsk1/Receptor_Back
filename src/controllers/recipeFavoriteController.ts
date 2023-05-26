import RecipeFavorite from "../models/recipeFavoriteModel";
import {
  createOne,
  deleteOne,
  deleteRecipeFavoriteByUser,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";

export const deleteRecipeFavByUser = deleteRecipeFavoriteByUser(RecipeFavorite)

export const getAllRecipeFavorite= getAll(RecipeFavorite);
export const getRecipeFavorite= getOne(RecipeFavorite);
export const createRecipeFavorite= createOne(RecipeFavorite);
export const updateRecipeFavorite= updateOne(RecipeFavorite);
export const deleteRecipeFavorite= deleteOne(RecipeFavorite);
