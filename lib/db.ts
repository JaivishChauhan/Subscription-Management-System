import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

/**
 * Singleton Prisma client for PostgreSQL.
 * Prisma 7 uses the pg driver adapter for direct Postgres connections.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set.")
}

const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
export const db = prisma // Add db export alias

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
