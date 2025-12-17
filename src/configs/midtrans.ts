import midtransClient from "midtrans-client";

const isProduction = (process.env.MIDTRANS_IS_PRODUCTION ?? "false") === "true";

export const midtransServerKey = process.env.MIDTRANS_SERVER_KEY ?? "";
export const midtransClientKey = process.env.MIDTRANS_CLIENT_KEY ?? "";

if (!midtransServerKey) {
  // jangan throw biar server gak crash di dev, tapi kamu wajib isi env
  console.warn("[MIDTRANS] MIDTRANS_SERVER_KEY is empty");
}

export const snap = new midtransClient.Snap({
  isProduction,
  serverKey: midtransServerKey,
  clientKey: midtransClientKey,
});
