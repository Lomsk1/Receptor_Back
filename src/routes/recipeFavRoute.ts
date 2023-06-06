import express from "express";
import { protect } from "../controllers/authController";
import {
  createRecipeFavorite,
  deleteRecipeFavByUser,
  deleteRecipeFavorite,
  getAllRecipeFavorite,
  getRecipeFavorite,
  getRecipeFavoriteByUser,
  updateRecipeFavorite,
} from "../controllers/recipeFavoriteController";
import { setRecipeUserIds } from "../controllers/reviewController";

const recipeFavoriteRoute = express.Router();

recipeFavoriteRoute
  .route("/deleteByUser/:userID/:recipeID")
  .delete(protect, deleteRecipeFavByUser);

recipeFavoriteRoute
  .route("/byUser/:userID")
  .get(protect, getRecipeFavoriteByUser());

recipeFavoriteRoute
  .route("/")
  .get(getAllRecipeFavorite)
  .post(protect, setRecipeUserIds, createRecipeFavorite);

recipeFavoriteRoute
  .route("/:id")
  .get(getRecipeFavorite)
  .patch(protect, updateRecipeFavorite)
  .delete(protect, deleteRecipeFavorite);

export default recipeFavoriteRoute;
