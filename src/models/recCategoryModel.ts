import mongoose, { Query, Document } from "mongoose";

interface ReceiptCategoryTypes {
  name: string;
  createdAt: Date;
}

interface ReceiptCategoryDocument extends ReceiptCategoryTypes, Document {}

const receiptCategorySchema = new mongoose.Schema<ReceiptCategoryTypes>(
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

// receiptCategorySchema.virtual("ingredients", {
//   ref: "Ingredient",
//   foreignField: "category",
//   localField: "_id",
// });

// receiptCategorySchema.pre(/^find/, function (next) {
//   const query = this as Query<
//     ReceiptCategoryDocument[],
//     ReceiptCategoryDocument
//   >;

//   query.populate({
//     path: "ingredients",
//     select: "name _id -category",
//   });
//   next();
// });

const ReceiptCategory = mongoose.model<ReceiptCategoryTypes & Document>(
  "ReceiptCategory",
  receiptCategorySchema
);

export default ReceiptCategory;
