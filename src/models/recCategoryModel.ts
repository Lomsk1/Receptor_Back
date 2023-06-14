import mongoose, { Document } from "mongoose";

interface ReceiptCategoryTypes {
  name: string;
  createdAt: Date;
}

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

const ReceiptCategory = mongoose.model<ReceiptCategoryTypes & Document>(
  "ReceiptCategory",
  receiptCategorySchema
);

export default ReceiptCategory;
