import express from "express";
import { protect } from "../controllers/authController";
import {
  createComment,
  deleteComment,
  getAllComments,
  getComment,
  getCommentByRecipeId,
  updateComment,
} from "../controllers/commentController";

const commentRoute = express.Router({
  mergeParams: true,
});

commentRoute.route("/").get(getAllComments).post(protect, createComment);

commentRoute
  .route("/:id")
  .get(getComment)
  .patch(protect, updateComment)
  .delete(protect, deleteComment);

commentRoute.route("/byRecipe/:id").get(getCommentByRecipeId());

export default commentRoute;
