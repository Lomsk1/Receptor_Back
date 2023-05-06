import Receipt from "../models/receiptModel";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory";

export const getAllReceipt = getAll(Receipt);
export const getReceiptById = getOne(Receipt);
// export const getReceiptById = getOne(Receipt, { path: "review" });
export const createReceipt = createOne(Receipt);
export const updateReceipt = updateOne(Receipt);
export const deleteReceipt = deleteOne(Receipt);
