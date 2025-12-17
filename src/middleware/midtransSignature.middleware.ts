import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { midtransServerKey } from "../configs/midtrans.js";

type MidtransNotification = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
};

export function verifyMidtransSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const body = req.body as MidtransNotification;

    const orderId = body.order_id ?? "";
    const statusCode = body.status_code ?? "";
    const grossAmount = body.gross_amount ?? "";
    const signatureKey = body.signature_key ?? "";

    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
      res.status(400).send("Invalid Midtrans payload");
      return;
    }

    if (!midtransServerKey) {
      res.status(500).send("Midtrans server key not configured");
      return;
    }

    const raw = `${orderId}${statusCode}${grossAmount}${midtransServerKey}`;
    const expected = crypto.createHash("sha512").update(raw).digest("hex");

    if (expected !== signatureKey) {
      res.status(401).send("Invalid signature");
      return;
    }

    next();
  } catch {
    res.status(500).send("Terjadi kesalahan pada server");
  }
}
