import express from "express";
import {
  createReceipt,
  deleteReceipt,
  getAllReceipt,
  getReceiptById,
  getReceiptFiltered,
  getRecipeStats,
  getRecipeStatsAnnually,
  updateReceipt,
  uploadRecipePhoto,
} from "../controllers/receiptController";
import { protect } from "../controllers/authController";
import reviewRoute from "./reviewRoute";

const receiptRoute = express.Router();

receiptRoute.use("/:tourId/reviews", reviewRoute);
receiptRoute.route("/recipe-stats").get(getRecipeStats);
receiptRoute.route("/recipe-stats/:year").get(getRecipeStatsAnnually);

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
