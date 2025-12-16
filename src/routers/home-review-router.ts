import express from "express";
import {
  createHomeReview,
  deleteHomeReview,
  getAllHomeReviews,
  getPublishedHomeReviews,
  updateHomeReview,
} from "../controllers/review-controller/home-review-controller.js";

const router = express.Router();

// Public (buat home page)
router.route("/").get(getPublishedHomeReviews).post(createHomeReview);

// Admin (opsional)
router.route("/all").get(getAllHomeReviews);

router.route("/:id").put(updateHomeReview).delete(deleteHomeReview);

export default router;
