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
app.get("/", async (_request: Request, response: Response) => {
  try {
    response.send("API is running...");
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});
// app.listen(PORT, () =>
//   console.info(` 🚀 Server is listening on port: ${PORT}`)
// );

export default app;
