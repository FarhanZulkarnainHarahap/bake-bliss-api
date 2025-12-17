import "dotenv/config";
import cors from "cors";
import express, { Request, Response, Application } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth-router.js";
import userRouter from "./routers/user-router.js";
import productsRouter from "./routers/product-router.js";
import reviewRouter from "./routers/review-router.js";
import homeReviewRouter from "./routers/home-review-router.js";
import orderRouter from "./routers/order.route.js";
import midtransRouter from "./routers/midtrans.route.js";
import { sendServerError } from "./utils/serverErrorHtml.js";

const PORT: number = (process.env.PORT as unknown as number) || 8000;
const app: Application = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "https://bake-bliss.vercel.app"], // Menambahkan localhost untuk development
    methods: ["GET", "POST", "PUT", "DELETE"], // Atur metode HTTP yang diizinkan
    credentials: true, // Mengizinkan pengiriman cookies dan headers
  })
);

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productsRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/home-reviews", homeReviewRouter);

// Routes
app.use("/api/orders", orderRouter);
app.use("/api/midtrans", midtransRouter);

app.get("/", async (_req: Request, res: Response) => {
  try {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>BakeBliss API</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top, #020617, #000);
      color: #38bdf8;
      font-family: "JetBrains Mono", monospace;
      overflow: hidden;
    }

    .panel {
      position: relative;
      width: 640px;
      padding: 48px;
      border-radius: 16px;
      border: 1px solid rgba(56, 189, 248, 0.5);
      background: linear-gradient(
        180deg,
        rgba(2, 6, 23, 0.85),
        rgba(2, 6, 23, 0.6)
      );
      box-shadow:
        0 0 40px rgba(56, 189, 248, 0.15),
        inset 0 0 20px rgba(56, 189, 248, 0.05);
      animation: boot 0.8s ease-out forwards;
    }

    @keyframes boot {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .panel::before,
    .panel::after {
      content: "";
      position: absolute;
      inset: -2px;
      border-radius: 18px;
      border: 1px solid rgba(56, 189, 248, 0.3);
      pointer-events: none;
      animation: pulse 3s linear infinite;
    }

    .panel::after {
      filter: blur(6px);
      opacity: 0.6;
    }

    @keyframes pulse {
      0% { opacity: 0.3; }
      50% { opacity: 0.6; }
      100% { opacity: 0.3; }
    }

    pre {
      margin: 0;
      font-size: 18px;
      line-height: 1.8;
      letter-spacing: 0.5px;
    }

    .title {
      color: #7dd3fc;
      font-size: 24px;
      margin-bottom: 24px;
      text-align: center;
    }

    .value {
      color: #22c55e;
      font-weight: bold;
      animation: blink 1.5s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    #time {
      color: #facc15;
      font-weight: bold;
    }

    .scanline {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(56,189,248,0.6),
        transparent
      );
      animation: scan 4s linear infinite;
    }

    @keyframes scan {
      from { top: 0; }
      to { top: 100%; }
    }
  </style>
</head>
<body>
  <div class="panel">
    <div class="scanline"></div>

    <div class="title">◆ SYSTEM PANEL ◆</div>

<pre>
[SYSTEM STATUS]
SERVICE : BAKEBLISS API
STATE   : <span class="value">ONLINE</span>
TIME    : <span id="time"></span>

SYSTEM INITIALIZED SUCCESSFULLY
</pre>
  </div>

  <script>
    const timeEl = document.getElementById("time");

    function updateTime() {
      timeEl.textContent = new Date().toISOString();
    }

    updateTime();
    setInterval(updateTime, 1000);
  </script>
</body>
</html>
`);
  } catch (error) {
    console.error(error);
    sendServerError(res);
  }
});

app.listen(PORT, () => console.info(` 🚀 Server is listening on port:${PORT}`));
export default app;
