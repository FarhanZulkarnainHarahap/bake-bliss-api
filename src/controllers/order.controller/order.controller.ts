import type { Request, Response } from "express";
import { prisma } from "../../configs/prisma.js";
import { createOrderWithMidtrans } from "../../service/order.service.js";
import { sendServerError } from "../../utils/serverErrorHtml.js";

type CreateOrderBody = {
  userId?: string | null; // optional (kalau ada login)
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  items: Array<{ productId: string; qty: number }>;
};

export async function createOrder(req: Request, res: Response) {
  try {
    const body = req.body as CreateOrderBody;

    if (!body?.items?.length) {
      res.status(400).send("Items tidak boleh kosong");
      return;
    }

    const result = await createOrderWithMidtrans({
      userId: body.userId ?? null,
      customerName: body.customerName ?? null,
      customerEmail: body.customerEmail ?? null,
      customerPhone: body.customerPhone ?? null,
      items: body.items,
    });

    res.status(201).send(result);
  } catch (error: unknown) {
    console.error(error);
    sendServerError(res);
  }
}

export async function getOrderByCode(req: Request, res: Response) {
  try {
    const { orderCode } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      res.status(404).send("Order tidak ditemukan");
      return;
    }

    res.send({ message: "OK", data: order });
  } catch (error: unknown) {
    console.error(error);
    sendServerError(res);
  }
}
