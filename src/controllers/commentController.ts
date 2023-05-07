import Comment from "../models/commentModel";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";

// export const setTourUserIds = (req, res, next) => {
//     // Allow nested routes
//     if (!req.body.tour) req.body.tour = req.params.tourId;
//     if (!req.body.user) req.body.user = req.user.id;

//     next();

//     //< If we need to add this extra information, we add this as the third parameter in our routes >
//   };
export const getAllComments = getAll(Comment);
export const getComment = getOne(Comment);
export const createComment = createOne(Comment);
export const deleteComment = deleteOne(Comment);
export const updateComment = updateOne(Comment);
