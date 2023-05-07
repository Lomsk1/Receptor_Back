import express from "express";
import { protect } from "../controllers/authController";
import {
  createComment,
  deleteComment,
  getAllComments,
  getComment,
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

export default commentRoute;
