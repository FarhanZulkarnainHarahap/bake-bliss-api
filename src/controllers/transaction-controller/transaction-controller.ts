import type { Request, Response } from "express";
import { MidtransClient } from "midtrans-node-client";
import { v7 as uuid } from "uuid";
import { prisma } from "../../configs/prisma.js";

const snap = new MidtransClient.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SANDBOX_SERVER_KEY ?? "",
});

export async function createTransaction(req: Request, res: Response) {
  try {
    const { productId, totalProduct } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const totalPrice = totalProduct * product.price;
    const localId = uuid();

    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          id: localId,
          productId,
          userId, // ✅ sekarang pasti string (udah di-guard)
          totalProduct,
          totalPrice, // Float di prisma, number OK
        },
      });

      // ✅ stock update dihapus
    });

    const midtransTransaction = await snap.createTransaction({
      transaction_details: {
        order_id: localId,
        gross_amount: totalPrice,
      },
      item_details: [
        {
          id: product.id,
          name: product.name,
          quantity: totalProduct,
          price: product.price,
        },
      ],
      customer_details: {
        first_name: req.user?.name,
        email: req.user?.email,
      },
    });

    res.status(201).json({
      message: "Transaction Created",
      data: { midtransTransaction },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create transaction" });
  }
}

export async function getOrderByCode(req: Request, res: Response) {
  try {
    const { orderCode } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: orderCode, // orderCode = transaction.id
      },
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json({
      message: "Transaction detail",
      data: transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get transaction" });
  }
}
