import express from "express";
import { protect } from "../controllers/authController";
import {
  createCommentLike,
  deleteComLikeByUser,
  deleteCommentLike,
  getAllCommentLike,
  getCommentLike,
  updateCommentLike,
} from "../controllers/commentLikeController";

const commentLikeRoute = express.Router();

commentLikeRoute
  .route("/deleteByUser/:userID/:commentID")
  .delete(protect, deleteComLikeByUser);

commentLikeRoute
  .route("/")
  .get(getAllCommentLike)
  .post(protect, createCommentLike);

commentLikeRoute
  .route("/:id")
  .get(getCommentLike)
  .patch(protect, updateCommentLike)
  .delete(protect, deleteCommentLike);

export default commentLikeRoute;
