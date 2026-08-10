import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { CloudinaryStorage } from "@/lib/storage/cloudinary";
import { requireAuthSession } from "@/lib/utils/session";
import { ForbiddenError, ValidationError } from "@/lib/errors/app-error";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can upload media");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderType = (formData.get("folderType") as string) || "photos";

    if (!file) {
      throw new ValidationError("No file provided for upload");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      throw new ValidationError("Unsupported file format. Allowed formats: JPG, PNG, WEBP");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError("File size exceeds 10MB limit");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validFolder = (["covers", "avatars", "photos"].includes(folderType)
      ? folderType
      : "photos") as "covers" | "avatars" | "photos";

    const result = await CloudinaryStorage.uploadMedia(buffer, validFolder);

    return successResponse(result, "Media uploaded successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
