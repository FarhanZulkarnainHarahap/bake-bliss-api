import { env } from "prisma/config";

console.log("ENV:", env("DATABASE_URL"));
