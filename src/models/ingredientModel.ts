import mongoose, { Document } from "mongoose";

interface IngredientTypes {
  name: string;
  category: mongoose.Types.ObjectId;
}

const ingredientSchema = new mongoose.Schema<IngredientTypes>({
  name: {
    type: String,
    required: [true, "აუცილებელია სახელის მითითება"],
  },
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IngredientCategory",
      required: [true, "სავალდებულია კატეგორიის მითითება"],
    },
  ],
});

const Ingredient = mongoose.model<IngredientTypes & Document>(
  "Ingredient",
  ingredientSchema
);

export default Ingredient;
