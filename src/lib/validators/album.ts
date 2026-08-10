import { z } from "zod";

export const createAlbumSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Album title is required")
    .max(100, "Album title cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable(),
  coverUrl: z
    .string()
    .trim()
    .url("Cover URL must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  eventDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null))
    .refine((date) => !date || !isNaN(date.getTime()), {
      message: "Invalid event date format",
    }),
});

export const updateAlbumSchema = createAlbumSchema.partial();

export const albumIdSchema = z.object({
  id: z.string().min(1, "Album ID is required"),
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;
