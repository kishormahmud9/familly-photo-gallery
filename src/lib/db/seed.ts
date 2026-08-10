import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

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
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log(`ℹ️ Admin user with email "${email}" already exists. Seed skipped.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name: "Gallery Admin",
        role: "ADMIN",
      },
    });

    console.log(`✅ Initial admin created successfully for: ${admin.email}`);
  } catch (error) {
    console.error("❌ Failed to seed initial admin user:", error);
    throw error;
  }
}
