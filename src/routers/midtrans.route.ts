import express from "express";

import { verifyMidtransSignature } from "../middleware/midtransSignature.middleware.js";
import { midtransNotification } from "../controllers/midtrans.controller/midtrans.controller.js";

const router = express.Router();

// Midtrans notification endpoint
router.post("/notification", verifyMidtransSignature, midtransNotification);

export default router;
