import express from "express";
import {
  createReceipt,
  deleteReceipt,
  getAllReceipt,
  getReceiptById,
  getReceiptFiltered,
  updateReceipt,
  uploadRecipePhoto,
} from "../controllers/receiptController";
import { protect } from "../controllers/authController";

const receiptRoute = express.Router({
  mergeParams: true,
});

receiptRoute
  .route("/")
  .get(getAllReceipt)
  .post(protect, uploadRecipePhoto, createReceipt);
receiptRoute.route("/filter").post(getReceiptFiltered);
receiptRoute
  .route("/:id")
  .get(getReceiptById)
  .patch(protect, uploadRecipePhoto, updateReceipt)
  .delete(protect, deleteReceipt);

export default receiptRoute;
