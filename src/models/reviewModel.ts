import { NextFunction } from "express";
import mongoose, { Document, Model } from "mongoose";
import Receipt from "./receiptModel";

interface ReviewTypes {
  rating: number;
  user: mongoose.Types.ObjectId;
  receipt: mongoose.Types.ObjectId;
  createdAt: Date;
  calcAverageRating(receiptId: mongoose.Types.ObjectId): Promise<void>;
  r?: any | null;
}

interface ReviewModel extends Model<ReviewTypes & Document> {
  calcAverageRating(receiptId: mongoose.Types.ObjectId): Promise<void>;
  r?: any | null;
}

const reviewSchema = new mongoose.Schema<ReviewTypes>({
  rating: {
    type: Number,
    min: 1,
    max: 5,
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
});

reviewSchema.index({ receipt: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRating = async function (receiptId) {
  const stats = await this.aggregate([
    {
      $match: { receipt: receiptId },
    },
    {
      $group: {
        _id: "$receipt",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  if (stats.length > 0) {
    await Receipt.findByIdAndUpdate(receiptId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Receipt.findByIdAndUpdate(receiptId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", async function () {
  (this.constructor as ReviewModel).calcAverageRating(this.receipt);
});

reviewSchema.pre(
  /^findOneAnd/,
  async function (this: ReviewModel, next: NextFunction) {
    this.r = await this.findOne();
    next();
  }
);

reviewSchema.post(/^findOneAnd/, async function (this: ReviewModel) {
  await this.r.constructor.calcAverageRating(this.r.receipt);
});

const Review = mongoose.model<ReviewTypes & ReviewModel & Document>(
  "Review",
  reviewSchema
);

export default Review;
