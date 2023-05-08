import express from "express";
import { protect, restrictTo } from "../controllers/authController";
import {
  createIngredient,
  deleteIngredient,
  getAllIngredients,
  getIngredient,
  updateIngredient,
} from "../controllers/ingredeintController";

const ingredientRoute = express.Router({
  mergeParams: true,
});

ingredientRoute
  .route("/")
  .get(getAllIngredients)
  .post(protect, restrictTo("editor", "admin"), createIngredient);

ingredientRoute
  .route("/:id")
  .get(getIngredient)
  .patch(protect, restrictTo("editor", "admin"), updateIngredient)
  .delete(protect, restrictTo("editor", "admin"), deleteIngredient);

export default ingredientRoute;
