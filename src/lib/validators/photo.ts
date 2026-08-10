import { z } from "zod";

export const photoQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
  albumId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt-desc", "createdAt-asc", "title-asc"]).default("createdAt-desc"),
});

export const updatePhotoSchema = z.object({
  title: z.string().trim().max(150, "Title cannot exceed 150 characters").optional().nullable(),
  description: z.string().trim().max(1000, "Description cannot exceed 1000 characters").optional().nullable(),
  albumId: z.string().min(1, "Target albumId is required").optional(),
});

export const photoIdSchema = z.object({
  id: z.string().min(1, "Photo ID is required"),
});

export const bulkDeletePhotosSchema = z.object({
  photoIds: z.array(z.string().min(1)).min(1, "At least one photo ID must be provided"),
});

export const bulkMovePhotosSchema = z.object({
  photoIds: z.array(z.string().min(1)).min(1, "At least one photo ID must be provided"),
  albumId: z.string().min(1, "Target albumId is required"),
});

export type PhotoQueryInput = z.infer<typeof photoQuerySchema>;
export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;
export type BulkDeletePhotosInput = z.infer<typeof bulkDeletePhotosSchema>;
export type BulkMovePhotosInput = z.infer<typeof bulkMovePhotosSchema>;
