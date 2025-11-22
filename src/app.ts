import express, { Request, Response, Application } from "express";
import "dotenv/config";
import cors from "cors";

import authRouter from "./routers/auth-router.js";

const app: Application = express();

const PORT: string = process.env.PORT || "8000";
app.use(
  cors({
    origin: ["http://localhost:3000", "https://bake-bliss.app"], // Menambahkan localhost untuk development
    methods: ["GET", "POST", "PUT", "DELETE"], // Atur metode HTTP yang diizinkan
    credentials: true, // Mengizinkan pengiriman cookies dan headers
  })
);
app.use(express.json());

app.use("/api/auth", authRouter);
app.get("/api/health", async (_request: Request, response: Response) => {
  response.status(200).json({
    message: "API is running",
    uptime: `${process.uptime().toFixed(2)} seconds`,
  });
});
app.listen(PORT, () => {
  console.info(`Server is listening on port: ${PORT}`);
});

export default app;
