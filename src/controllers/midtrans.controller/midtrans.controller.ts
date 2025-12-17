import type { Request, Response } from "express";
import { prisma } from "../../configs/prisma.js";
import { sendServerError } from "../../utils/serverErrorHtml.js";

type MidtransNotificationBody = {
  order_id?: string;
  transaction_id?: string;
  payment_type?: string;
  transaction_status?: string;
  fraud_status?: string;
  gross_amount?: string;
  currency?: string;
};

function mapToPaymentStatus(txStatus: string | null | undefined) {
  const s = (txStatus ?? "").toLowerCase();

  if (s === "settlement" || s === "capture") return "SUCCESS";
  if (s === "pending") return "PENDING";
  if (s === "expire") return "EXPIRED";
  if (s === "cancel" || s === "deny") return "FAILED";
  if (s === "refund") return "REFUNDED";
  return "PENDING";
}

function mapToOrderStatus(txStatus: string | null | undefined) {
  const s = (txStatus ?? "").toLowerCase();

  if (s === "settlement" || s === "capture") return "PAID";
  if (s === "pending") return "PENDING";
  if (s === "expire") return "EXPIRED";
  if (s === "cancel" || s === "deny") return "CANCELLED";
  return "PENDING";
}

export async function midtransNotification(req: Request, res: Response) {
  try {
    const body = req.body as MidtransNotificationBody;

    const orderId = body.order_id ?? "";
    if (!orderId) {
      res.status(400).send("Missing order_id");
      return;
    }

    const order = await prisma.order.findUnique({
      where: { orderCode: orderId },
      include: { payment: true },
    });

    if (!order || !order.payment) {
      res.status(404).send("Order/payment not found");
      return;
    }

    const paymentStatus = mapToPaymentStatus(body.transaction_status);
    const orderStatus = mapToOrderStatus(body.transaction_status);

    await prisma.paymentTransaction.update({
      where: { id: order.payment.id },
      data: {
        transactionId: body.transaction_id ?? undefined,
        paymentType: body.payment_type ?? undefined,
        transactionStatus: body.transaction_status ?? undefined,
        fraudStatus: body.fraud_status ?? undefined,
        status: paymentStatus,
        grossAmount: body.gross_amount ? Number(body.gross_amount) : undefined,
        currency: body.currency ?? undefined,
      },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { status: orderStatus },
    });

    // Midtrans butuh 200 OK
    res.send("OK");
  } catch (error: unknown) {
    console.error(error);
    sendServerError(res);
  }
}
