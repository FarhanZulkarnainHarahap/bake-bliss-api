import express from "express";
import {
  createReview,
  deleteReview,
  getReviewById,
  getReviewsByProduct,
  updateReview,
} from "../controllers/review-controller/review-controller.js";

const router = express.Router();
// Create review
router.route("/").post(createReview);

// List review per product
router.route("/product/:productId").get(getReviewsByProduct);

// Detail review
router.route("/:id").get(getReviewById).put(updateReview).delete(deleteReview);

export default router;
