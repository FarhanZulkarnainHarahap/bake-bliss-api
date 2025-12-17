import { snap } from "../configs/midtrans.js";
import { prisma } from "../configs/prisma.js";

type CreateOrderItemInput = {
  productId: string;
  qty: number;
};

type CreateOrderInput = {
  userId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  items: CreateOrderItemInput[];
};

type ProductSnapshot = {
  id: string;
  name: string;
  price: number;
};

function generateOrderCode(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BB-${y}${m}${d}-${rand}`;
}

function normalizeQty(qty: number): number {
  if (!Number.isInteger(qty) || qty <= 0) throw new Error("qty minimal 1");
  return qty;
}

export async function createOrderWithMidtrans(input: CreateOrderInput) {
  if (!input.items?.length) {
    throw new Error("Items tidak boleh kosong");
  }

  // 1) Ambil produk untuk snapshot harga + nama
  const productIds = input.items.map((i) => i.productId);
  const products: ProductSnapshot[] = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true },
  });

  const productMap = new Map<string, ProductSnapshot>(
    products.map((p) => [p.id, p])
  );

  const orderItems = input.items.map((it) => {
    const p = productMap.get(it.productId);
    if (!p) throw new Error(`Product tidak ditemukan: ${it.productId}`);

    const qty = normalizeQty(it.qty);
    const subtotal = p.price * qty;

    return {
      productId: p.id,
      name: p.name,
      price: p.price,
      qty,
      subtotal,
    };
  });

  const totalAmount = orderItems.reduce((sum, x) => sum + x.subtotal, 0);
  const orderCode = generateOrderCode();

  // 2) Simpan Order + Items + PaymentTransaction (tanpa payload json)
  const order = await prisma.order.create({
    data: {
      orderCode,
      userId: input.userId ?? null,
      customerName: input.customerName ?? null,
      customerEmail: input.customerEmail ?? null,
      customerPhone: input.customerPhone ?? null,
      totalAmount,
      currency: "IDR",
      status: "PENDING",
      items: {
        create: orderItems.map((x) => ({
          productId: x.productId,
          name: x.name,
          price: x.price,
          qty: x.qty,
          subtotal: x.subtotal,
        })),
      },
      payment: {
        create: {
          provider: "MIDTRANS",
          midtransOrderId: orderCode,
          grossAmount: totalAmount,
          currency: "IDR",
          status: "PENDING",
        },
      },
    },
    include: { items: true, payment: true },
  });

  // 3) Request Snap Token ke Midtrans
  const transactionParams = {
    transaction_details: {
      order_id: order.orderCode,
      gross_amount: order.totalAmount,
    },
    customer_details: {
      first_name: order.customerName ?? "Customer",
      email: order.customerEmail ?? "customer@example.com",
      phone: order.customerPhone ?? "",
    },
    item_details: order.items.map((it) => ({
      id: it.productId,
      name: it.name,
      price: it.price,
      quantity: it.qty,
    })),
  };

  const snapResp = await snap.createTransaction(transactionParams);

  // 4) Update snapToken & redirectUrl (TANPA simpan payload response)
  const payment = await prisma.paymentTransaction.update({
    where: { orderId: order.id },
    data: {
      snapToken: String((snapResp as { token?: unknown }).token ?? ""),
      redirectUrl: String(
        (snapResp as { redirect_url?: unknown }).redirect_url ?? ""
      ),
      // transactionStatus: "pending", // optional: isi kalau field kamu ada
      // paymentType: undefined,        // optional: isi nanti dari webhook
      grossAmount: order.totalAmount,
      status: "PENDING",
    },
  });

  return {
    order,
    snapToken: payment.snapToken,
    redirectUrl: payment.redirectUrl,
  };
}
