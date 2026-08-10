import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { createAlbumSchema } from "@/lib/validators/album";
import { AlbumService } from "@/services/albumBackendService";
import { requireAuthSession } from "@/lib/utils/session";
import { ForbiddenError } from "@/lib/errors/app-error";

export async function GET(_req: NextRequest) {
  try {
    const albums = await AlbumService.getAlbums();
    return successResponse(albums);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can create albums");
    }

    const body = await validateRequestBody(req, createAlbumSchema);
    const album = await AlbumService.createAlbum(body);
    return successResponse(album, "Album created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
