import "dotenv/config";
import cors from "cors";
import express, { Request, Response, Application } from "express";

import authRouter from "./routers/auth-router.js";

const app: Application = express();

const PORT: number = (process.env.PORT as unknown as number) || 8000;
app.use(
  cors({
    origin: ["http://localhost:3000", "https://bake-bliss.app"], // Menambahkan localhost untuk development
    methods: ["GET", "POST", "PUT", "DELETE"], // Atur metode HTTP yang diizinkan
    credentials: true, // Mengizinkan pengiriman cookies dan headers
  })
);
app.use(express.json());

app.use("/api/auth", authRouter);
app.get("/", async (_req: Request, res: Response) => {
  try {
    res.send("API is running...");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});
app.listen(PORT, () =>
  console.info(` 🚀 Server is listening on port: http://localhost:${PORT}`)
);

export default app;
