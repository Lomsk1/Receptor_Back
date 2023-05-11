import ReceiptCategory from "../models/recCategoryModel";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";

export const getAllRecCategory = getAll(ReceiptCategory);
export const getRecCategory = getOne(ReceiptCategory);
export const createRecCategory = createOne(ReceiptCategory);
export const deleteRecCategory = deleteOne(ReceiptCategory);
export const updateRecCategory = updateOne(ReceiptCategory);
