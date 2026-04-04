import { PrismaClient } from "@prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

/**
 * Singleton Prisma client with better-sqlite3 driver adapter (Prisma v7).
 * Prevents multiple instances during Next.js hot-reload in development.
 *
 * @architecture Uses better-sqlite3 for local dev (zero external deps).
 * For production (Vercel + Neon): swap adapter to @prisma/adapter-pg.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const database = new Database(dbPath);
  const adapter = new PrismaBetterSQLite3(database);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
