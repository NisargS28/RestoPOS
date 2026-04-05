import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // ── Create Roles ──
    const superAdmin = await prisma.role.create({
      data: { name: "SUPER_ADMIN" },
    });
    await prisma.role.createMany({
      data: [
        { name: "BRANCH_ADMIN" },
        { name: "CASHIER" },
        { name: "KITCHEN" },
      ],
    });

    console.log("Roles created");
  } catch (e) {
    console.error("Error in role creation:", e);
  }
}

main().finally(() => prisma.$disconnect());
