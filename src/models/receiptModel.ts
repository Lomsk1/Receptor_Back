import mongoose, { Document } from "mongoose";

interface ReceiptTypes {
  name: string;
  shortDescription: string;
  difficulty: string;
  cookingTime: string;
  portion: number;
  slug: string;
  coverImage: string;
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
}

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
    coverImage: {
      type: String,
      required: [true, "გთხოვთ, ავირთოთ სურათი"],
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
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

// categorySchema.virtual("projects", {
//     ref: "Project",
//     foreignField: "category",
//     localField: "_id",
//   });

//   categorySchema.pre(/^find/, function (next) {
//     this.populate({
//       path: "projects",
//     });
//     next();
//   });

const Receipt = mongoose.model<ReceiptTypes & Document>(
  "Receipt",
  receiptSchema
);

export default Receipt;
