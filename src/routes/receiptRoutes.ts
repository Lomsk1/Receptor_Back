import express from "express";
import {
  createReceipt,
  deleteReceipt,
  getAllReceipt,
  getReceiptById,
  updateReceipt,
} from "../controllers/receiptController";
import { protect } from "../controllers/authController";

const receiptRoute = express.Router({
  mergeParams: true,
});

receiptRoute.route("/").get(getAllReceipt).post(protect, createReceipt);

receiptRoute
  .route("/:id")
  .get(getReceiptById)
  .patch(protect, updateReceipt)
  .delete(protect, deleteReceipt);

export default receiptRoute;
