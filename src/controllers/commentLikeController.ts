import CommentLike from "../models/commentLikeModel";
import {
  createOne,
  deleteCommentLikeByUser,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";

export const deleteComLikeByUser = deleteCommentLikeByUser(CommentLike)

export const getAllCommentLike = getAll(CommentLike);
export const getCommentLike = getOne(CommentLike);
export const createCommentLike = createOne(CommentLike);
export const updateCommentLike = updateOne(CommentLike);
export const deleteCommentLike = deleteOne(CommentLike);
