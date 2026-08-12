import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot reloads in dev so we don't
// open a new connection pool on every file change.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Prisma 7 talks to Postgres through an explicit driver adapter rather
// than its own bundled query engine binary.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
