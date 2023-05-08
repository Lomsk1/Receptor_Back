import express from "express";
import { protect, restrictTo } from "../controllers/authController";
import {
  createIngredientCategory,
  deleteIngredientCategory,
  getAllIngredientCategory,
  getIngredientCategory,
  updateIngredientCategory,
} from "../controllers/ingrCategory";

const ingredientCategoryRoute = express.Router({
  mergeParams: true,
});

ingredientCategoryRoute
  .route("/")
  .get(getAllIngredientCategory)
  .post(protect, restrictTo("editor", "admin"), createIngredientCategory);

ingredientCategoryRoute
  .route("/:id")
  .get(getIngredientCategory)
  .patch(protect, restrictTo("editor", "admin"), updateIngredientCategory)
  .delete(protect, restrictTo("editor", "admin"), deleteIngredientCategory);

export default ingredientCategoryRoute;
