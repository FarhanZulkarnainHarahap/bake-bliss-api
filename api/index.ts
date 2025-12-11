import app from "../src/app.js";

export default function handler(req: any, res: any) {
  // 🔥 Paksa header CORS DI SINI
  const origin = req.headers.origin;

  const allowedOrigins = [
    "http://localhost:3000",
    "https://bake-bliss.vercel.app",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 🌐 Preflight (OPTIONS) – jangan diteruskan ke Express
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Lanjutkan ke Express app
  return app(req, res);
}
