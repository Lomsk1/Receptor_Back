import { NextFunction } from "express";
import mongoose, { Query, Document } from "mongoose";

interface CommentTypes {
  user: mongoose.Types.ObjectId;
  receipt: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
}
interface CommentDocument extends CommentTypes, Document {}

const commentSchema = new mongoose.Schema<CommentTypes>(
  {
    comment: {
      type: String,
      required: [true, "სავალდებულოა კომენტარის დაწერა"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "სავალდებულია მომხამრებლის მითითება"],
    },
    receipt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receipt",
      required: [true, "სავალდებულია რეცეპტის მითითება"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
commentSchema.virtual("likes", {
  ref: "CommentLike",
  foreignField: "comment",
  localField: "_id",
});

commentSchema.pre(/^find/, function (next: NextFunction) {
  const query = this as Query<CommentDocument[], CommentDocument>;

  query
    .populate({
      path: "user",
      select: "firstName avatar",
    })
    .populate({
      path: "likes",
      select: "_id user",
    });

  next();
});

const Comment = mongoose.model<CommentTypes & Document>(
  "Comment",
  commentSchema
);

export default Comment;
