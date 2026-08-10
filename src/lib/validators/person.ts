import "server-only";
import { z } from "zod";

export const createPersonSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  role: z.string().max(100).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  birthYear: z.number().int().min(1800).max(2100).optional().nullable(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().or(z.literal("")).nullable(),
  cloudinaryPublicId: z.string().optional().nullable(),
});

export const updatePersonSchema = createPersonSchema.partial();

export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
