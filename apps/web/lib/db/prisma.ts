import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const fallbackDatabaseUrl = "postgresql://placeholder:placeholder@localhost:5432/complete_coach";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? fallbackDatabaseUrl
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.PRISMA_DEBUG_LOGS === "1"
        ? [
            { emit: "stdout", level: "query" },
            { emit: "stdout", level: "info" },
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" }
          ]
        : [{ emit: "stdout", level: "error" }]
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
