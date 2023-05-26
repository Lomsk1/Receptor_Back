import { NextFunction } from "express";
import mongoose, { Query, Document } from "mongoose";

interface RecipeFavoriteTypes {
  user: mongoose.Types.ObjectId;
  recipe: mongoose.Types.ObjectId;
}

const RecipeFavoriteSchema = new mongoose.Schema<RecipeFavoriteTypes>({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Receipt",
    required: [true, "სავალდებულია რეცეპტის ID მითითება"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "სავალდებულია მომხამრებლის ID მითითება"],
  },
});

RecipeFavoriteSchema.index({ recipe: 1, user: 1 });


const RecipeFavorite = mongoose.model<RecipeFavoriteTypes & Document>(
  "RecipeFavorite",
  RecipeFavoriteSchema
);

export default RecipeFavorite;
