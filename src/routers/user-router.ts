import express from "express";
import {
  getUserProfile,
  getAllUsers,
} from "../controllers/user-controller/user/user-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

// endpoint: GET /api/users/profile
router.route("/profile").get(verifyToken, getUserProfile);

// endpoint: GET /api/users
router.route("/").get(verifyToken, getAllUsers);

export default router;
