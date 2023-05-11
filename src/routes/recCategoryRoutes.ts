import express from "express";
import { protect, restrictTo } from "../controllers/authController";
import {
  createRecCategory,
  deleteRecCategory,
  getAllRecCategory,
  getRecCategory,
  updateRecCategory,
} from "../controllers/recCategoryController";

const recCategoryRoute = express.Router({
  mergeParams: true,
});

recCategoryRoute
  .route("/")
  .get(getAllRecCategory)
  .post(protect, restrictTo("editor", "admin"), createRecCategory);

recCategoryRoute
  .route("/:id")
  .get(getRecCategory)
  .patch(protect, restrictTo("editor", "admin"), updateRecCategory)
  .delete(protect, restrictTo("editor", "admin"), deleteRecCategory);

export default recCategoryRoute;
