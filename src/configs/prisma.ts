import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import pkg from "pg";

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
const adapter = new PrismaPg(pool);
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

export { prisma };
