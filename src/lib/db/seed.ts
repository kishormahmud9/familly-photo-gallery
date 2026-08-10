import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const rawPassword = process.env.ADMIN_PASSWORD;

  if (!email || !rawPassword) {
    console.warn("⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not configured in environment variables. Skipping admin seed.");
    return;
  }

  try {
    const hashedPassword = await argon2.hash(rawPassword, {
      type: argon2.argon2id,
    });

    const admin = await prisma.admin.upsert({
      where: { email },
      update: {
        password: hashedPassword,
      },
      create: {
        email,
        password: hashedPassword,
        name: "Gallery Admin",
        role: "ADMIN",
      },
    });

    console.log(`✅ Admin account configured/reseeded successfully for: ${admin.email} (Argon2id)`);
  } catch (error) {
    console.error("❌ Failed to seed initial admin user:", error);
    throw error;
  }
}
