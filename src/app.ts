import express, { Request, Response, Application } from "express";
import "dotenv/config";
import cors from "cors";

import authRouter from "./routers/auth-router.js";

import prisma from "./configs/prisma.js";

const app: Application = express();

const PORT: string = process.env.PORT || "8000";
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.get("/", (_req: Request, res: Response) => {
  res.send("🍰 API Jual Kue berjalan dengan baik!");
});
app.listen(PORT, () => {
  console.info(`Server is listening on port: ${PORT}`);
});

export default app;
