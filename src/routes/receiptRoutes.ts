import express from "express";
import {
  createReceipt,
  deleteReceipt,
  getAllReceipt,
  getReceiptById,
  getReceiptFiltered,
  getRecipeBySlug,
  getRecipeStats,
  getRecipeStatsAnnually,
  updateReceipt,
  uploadRecipePhoto,
} from "../controllers/receiptController";
import { protect, restrictTo } from "../controllers/authController";
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
receiptRoute.route("/slug/:slug").get(getRecipeBySlug());

receiptRoute
  .route("/:id")
  .get(getReceiptById)
  .patch(protect, uploadRecipePhoto, updateReceipt)
  .delete(protect, deleteReceipt);

receiptRoute
  .route("/byAdmin/:id")
  .delete(protect, deleteReceipt, restrictTo("admin", "editor"));

export default receiptRoute;
