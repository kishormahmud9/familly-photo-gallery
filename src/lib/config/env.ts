import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().optional(),
  AUTH_SECRET: z.string().default("default-dev-secret-family-photo-gallery-auth-2026-key"),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formattedErrors = result.error.format();
    console.error("❌ Invalid environment variables:", JSON.stringify(formattedErrors, null, 2));
    throw new Error("Invalid server environment configuration.");
  }
  return result.data;
}

export const env = parseEnv();
