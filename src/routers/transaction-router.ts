import express from "express";
import {
  createTransaction,
  getOrderByCode,
} from "../controllers/transaction-controller/transaction-controller.js";
import { verifyToken } from "@/middleware/auth-middleware.js";

const router = express.Router();

router.route("/").post(verifyToken, createTransaction);
router.route("/:orderCode").get(verifyToken, getOrderByCode);

export default router;
