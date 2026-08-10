import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { requireAuthSession } from "@/lib/utils/session";
import { ForbiddenError, ValidationError } from "@/lib/errors/app-error";
import { PhotoUploadService, FileToUpload } from "@/services/photoUploadService";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can upload photos");
    }

    const formData = await req.formData();
    const albumId = formData.get("albumId") as string;

    if (!albumId) {
      throw new ValidationError("albumId field is required");
    }

    // Parse optional personIds — sent as a JSON array string or multiple form fields
    let personIds: string[] = [];
    const personIdsRaw = formData.get("personIds");
    if (personIdsRaw && typeof personIdsRaw === "string") {
      try {
        const parsed = JSON.parse(personIdsRaw);
        if (Array.isArray(parsed)) personIds = parsed.filter((id) => typeof id === "string");
      } catch {
        // Not JSON — ignore
      }
    }

    const rawFiles = formData.getAll("files");
    if (!rawFiles || rawFiles.length === 0) {
      throw new ValidationError("No files attached in form data");
    }

    const filesToUpload: FileToUpload[] = [];

    for (const item of rawFiles) {
      if (item && typeof item === "object" && "arrayBuffer" in item) {
        const fileObj = item as File;
        const arrayBuffer = await fileObj.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        filesToUpload.push({
          buffer,
          filename: fileObj.name || "unnamed.jpg",
          mimeType: fileObj.type || "image/jpeg",
          size: fileObj.size,
        });
      }
    }

    if (filesToUpload.length === 0) {
      throw new ValidationError("No valid file objects received");
    }

    const result = await PhotoUploadService.uploadPhotosForAlbum(albumId, filesToUpload, personIds);
    return successResponse(result, "Upload processing completed");
  } catch (error) {
    return handleApiError(error);
  }
}
