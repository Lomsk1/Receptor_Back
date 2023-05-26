import express from "express";
import { protect } from "../controllers/authController";
import {
  createReview,
  deleteReview,
  getAllReview,
  getReview,
  setRecipeUserIds,
  updateReview,
} from "../controllers/reviewController";

const reviewRoute = express.Router({
  mergeParams: true,
});

reviewRoute.route("/").get(getAllReview).post(protect,setRecipeUserIds, createReview);

reviewRoute
  .route("/:id")
  .get(getReview)
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

export default reviewRoute;
