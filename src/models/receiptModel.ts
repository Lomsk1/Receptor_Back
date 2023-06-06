import { NextFunction } from "express";
import mongoose, { Document, Query } from "mongoose";
import slugify from "slugify";

interface ReceiptTypes {
  name: string;
  shortDescription: string;
  difficulty: string;
  cookingTime: string;
  portion: number;
  slug: string;
  image: {
    data: Buffer;
    contentType: string;
    name: string;
    destination: string;
    public_id: string;
    url: string;
  };
  category: string;
  nutrition: {
    type: boolean;
    title: {
      name: boolean;
      weight: number;
    };
  };
  createdAt: Date;
  cookingProcess: {
    step: number;
    description: string;
  };
  author: mongoose.Types.ObjectId;
  ingredients: mongoose.Types.ObjectId;
  recipeCategory: mongoose.Types.ObjectId;
  review: any;
  necessaryIngredients: {
    name: string;
  };
  ratingsAverage: number;
  ratingsQuantity: number;
}
interface ReceiptDocument extends ReceiptTypes, Document {}

const nutritionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nutrition title name is required"],
  },
  weight: {
    type: Number,
    required: [true, "Nutrition title weight is required"],
  },
});

const receiptSchema = new mongoose.Schema<ReceiptTypes>(
  {
    name: {
      type: String,
      required: [true, "რეცეპტი უნდა შეიცავდეს სახელს"],
      trim: true,
    },
    slug: String,
    shortDescription: {
      type: String,
      required: [true, "რეცეპტი უნდა შეიცავდეს მოკლე აღწერას"],
    },
    difficulty: {
      type: String,
      required: [true, "რეცეპტი უნდა შეიცავდეს სირთულეს"],
      enum: {
        values: ["მარტივი", "საშუალო", "რთული"],
        message: "აირჩიერთ ერთ-ერთი სირთულე: მარტივი, საშუალო ან რთული",
      },
    },
    cookingTime: {
      type: String,
      required: [true, "გთხოვთ, მიუთითეთ მომზადების დრო"],
    },
    portion: {
      type: Number,
      default: 1,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    image: {
      data: Buffer,
      contentType: String,
      name: String,
      destination: String,
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    nutrition: {
      type: [nutritionSchema],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false, //not show while response
    },
    cookingProcess: [
      {
        step: Number,
        description: String,
      },
    ],
    necessaryIngredients: [
      {
        name: String,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ავტორის მითითება სავალდებულოა"],
    },
    ingredients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient",
        required: [true, "სავალდებულია სულ მცირე 1 ინგრედეინტის მითითება"],
      },
    ],
    recipeCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReceiptCategory",
      required: [true, "კატეგორიის მითითება სავალდებულოა"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

receiptSchema.virtual("review", {
  ref: "Review",
  foreignField: "receipt",
  localField: "_id",
});

receiptSchema.pre(/^find/, function (next: NextFunction) {
  const query = this as Query<ReceiptDocument[], ReceiptDocument>;

  query
    .populate({
      path: "author",
      select: "firstName avatar",
    })
    .populate({
      path: "ingredients",
      select: "name",
    })
    .populate({
      path: "recipeCategory",
      select: "name",
    })
    .populate({
      path: "review",
      select: "user -receipt -_id",
    });

  next();
});

function generateSlug(name: string) {
  // Custom logic to generate slugs without converting names to English
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return slug;
}
receiptSchema.pre("save", function (next) {
  this.slug = generateSlug(this.name);
  next();
});

const Receipt = mongoose.model<ReceiptTypes & Document>(
  "Receipt",
  receiptSchema
);

export default Receipt;
