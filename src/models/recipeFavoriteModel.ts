import mongoose, { Query, Document, Model } from "mongoose";

interface RecipeFavoriteTypes {
  user: mongoose.Types.ObjectId;
  recipe: mongoose.Types.ObjectId;
}

interface RecipeFavoriteDocument extends RecipeFavoriteTypes, Document {}

export interface RecipeFavDoc extends Document {
  user: mongoose.Types.ObjectId;
  recipe: mongoose.Types.ObjectId;
  recipePopulate(): Function;
}

export interface RecipeFavModel extends Model<RecipeFavDoc> {
  build(attrs: RecipeFavoriteTypes): RecipeFavDoc;
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

// RecipeFavoriteSchema.pre(/^find/, function (next) {
//   const query = this as Query<RecipeFavoriteDocument[], RecipeFavoriteDocument>;
//   query.populate({
//     path: "recipe",
//     select: {
//       _id: 1,
//       name: 1,
//       difficulty: 1,
//       cookingTime: 1,
//       image: 1,
//       author: 0,
//       ingredients: 0,
//       recipeCategory: 0,
//       review: 0,
//     },
//   });
//   next();
// });

RecipeFavoriteSchema.methods.recipePopulate = async function () {
  const query = this as Query<RecipeFavoriteDocument[], RecipeFavoriteDocument>;
  await query.populate({
    path: "recipe",
    select: {
      _id: 1,
      name: 1,
      difficulty: 1,
      cookingTime: 1,
      image: 1,
      author: 0,
      ingredients: 0,
      recipeCategory: 0,
      review: 0,
    },
  });
};

const RecipeFavorite = mongoose.model<
  RecipeFavoriteTypes & RecipeFavDoc & Document
>("RecipeFavorite", RecipeFavoriteSchema);

export default RecipeFavorite;
