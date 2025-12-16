import "dotenv/config";
import cors from "cors";
import express, { Request, Response, Application } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth-router.js";
import userRouter from "./routers/user-router.js";
import productsRouter from "./routers/product-router.js";
import reviewRouter from "./routers/review-router.js";

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

app.get("/", async (_req: Request, res: Response) => {
  try {
    res.send(`
====================================
🚀  BAKEBLISS API
✅  STATUS : RUNNING
⏱️  TIME   : ${new Date().toISOString()}
====================================
`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productsRouter);
app.use("/api/reviews", reviewRouter);

app.listen(PORT, () => console.info(` 🚀 Server is listening on port:${PORT}`));
export default app;
