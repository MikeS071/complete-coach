import { defineConfig } from "prisma/config";
import { loadLocalEnvFiles } from "./lib/env-loader";

loadLocalEnvFiles();

const fallbackDatabaseUrl = "postgresql://placeholder:placeholder@localhost:5432/complete_coach";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? fallbackDatabaseUrl
  }
});
