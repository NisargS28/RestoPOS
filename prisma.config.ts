// Prisma 7.x config — connection URLs must be here, not in schema.prisma
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct connection for CLI operations (migrations, db push)
    // The pooler URL is used at runtime via the adapter in PrismaClient
    url: process.env["DIRECT_URL"],
  },
});
