import multer from "multer";
import Receipt from "../models/receiptModel";
import {
  createOne,
  deleteOne,
  getAll,
  getAllByFilter,
  getOne,
  updateOne,
} from "./handlerFactory";
import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appErrors";
import { catchAsync } from "../utils/catchAsync";

const multerStorage = multer.memoryStorage();

const multerFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: Function
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("გთხოვთ ატვირთოთ ფოტო!", 400), false);
  }
};

const upload = multer({
  dest: "src/images/recipe",
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadRecipePhoto = upload.single("image");

export const getReceiptFiltered = getAllByFilter(Receipt);
export const getAllReceipt = getAll(Receipt);
export const getReceiptById = getOne(Receipt);
export const createReceipt = createOne(Receipt);
export const updateReceipt = updateOne(Receipt);
export const deleteReceipt = deleteOne(Receipt);

export const getRecipeStats = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await Receipt.aggregate([
      {
        $match: { ratingsAverage: { $gte: 1 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numRecipes: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      stats,
    });
  }
);

export const getRecipeStatsAnnually = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const year = Number(req.params.year);

    const stats = await Receipt.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          numRecipes: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                monthsInString: [
                  "",
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ],
              },
              in: {
                $arrayElemAt: ["$$monthsInString", "$_id.month"],
              },
            },
          },
          numRecipes: 1,
          numRatings: 1,
        },
      },
    ]);
    res.status(200).json({
      status: "success",
      stats,
    });
  }
);

export const getRecipeBySlug = () =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { slug } = req.params;

    const slugs = slug.split(" ").filter(Boolean); // Split the slug into individual slugs

    const regexConditions = slugs.map((s) => new RegExp(s, "i")); // Create regex patterns for each slug
    const query = { slug: { $in: regexConditions } };

    const data = await Receipt.find(query);

    res.status(200).json({
      status: "success",
      result: data.length,
      data,
    });
  });