import express from "express";
import {
  createOrder,
  getOrderByCode,
} from "../controllers/order.controller/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/:orderCode", getOrderByCode);

export default router;
