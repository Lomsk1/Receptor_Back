import { NextFunction } from "express";
import mongoose, { Query, Document } from "mongoose";

interface CommentLikeTypes {
  user: mongoose.Types.ObjectId;
  comment: mongoose.Types.ObjectId;
}

const CommentLikeSchema = new mongoose.Schema<CommentLikeTypes>(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: [true, "სავალდებულია კომენტარის ID მითითება"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "სავალდებულია მომხამრებლის ID მითითება"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CommentLikeSchema.index({ comment: 1, user: 1 }, { unique: true });

const CommentLike = mongoose.model<CommentLikeTypes & Document>(
  "CommentLike",
  CommentLikeSchema
);

export default CommentLike;
