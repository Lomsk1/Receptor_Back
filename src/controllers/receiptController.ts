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
import { Request } from "express";
import AppError from "../utils/appErrors";

// const multerStorage = multer.memoryStorage({
//   destination: function (
//     _req: Request,
//     _file: Express.Multer.File,
//     cb: Function
//   ) {
//     cb(null, "src/images/recipe");
//   },
//   filename: function (_req: Request, file: Express.Multer.File, cb: Function) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
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

// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
// });

// export const uploadRecipePhoto = upload.single("image");

export const getReceiptFiltered = getAllByFilter(Receipt);
export const getAllReceipt = getAll(Receipt);
export const getReceiptById = getOne(Receipt);
// export const getReceiptById = getOne(Receipt, { path: "user" });
export const createReceipt = createOne(Receipt);
export const updateReceipt = updateOne(Receipt);
export const deleteReceipt = deleteOne(Receipt);
