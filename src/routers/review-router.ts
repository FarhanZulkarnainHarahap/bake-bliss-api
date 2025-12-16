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
router.post("/", createReview);

// List review per product
router.get("/product/:productId", getReviewsByProduct);

// Detail review
router.get("/:id", getReviewById);

// Update review
router.put("/:id", updateReview);

// Delete review
router.delete("/:id", deleteReview);

export default router;
