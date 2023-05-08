import mongoose, { Query, Document } from "mongoose";

interface IngredientCategoryTypes {
  name: string;
  createdAt: Date;
}

interface IngredientCategoryDocument
  extends IngredientCategoryTypes,
    Document {}

const ingredientCategorySchema = new mongoose.Schema<IngredientCategoryTypes>(
  {
    name: {
      type: String,
      required: [true, "მიუთითეთ კატეგორიის სათაური"],
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ingredientCategorySchema.virtual("ingredients", {
  ref: "Ingredient",
  foreignField: "category",
  localField: "_id",
});

ingredientCategorySchema.pre(/^find/, function (next) {
  const query = this as Query<
    IngredientCategoryDocument[],
    IngredientCategoryDocument
  >;

  query.populate({
    path: "ingredients",
    select: "name _id -category",
  });
  next();
});

const IngredientCategory = mongoose.model<IngredientCategoryTypes & Document>(
  "IngredientCategory",
  ingredientCategorySchema
);

export default IngredientCategory;
