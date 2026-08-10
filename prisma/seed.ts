import "dotenv/config";
import { seedAdmin } from "../src/lib/db/seed";

async function main() {
  console.log("🌱 Starting database seeding...");
  await seedAdmin();
  console.log("🌱 Database seeding completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seed script failed:", e);
    process.exit(1);
  });
