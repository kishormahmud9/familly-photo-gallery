import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { updateAlbumSchema } from "@/lib/validators/album";
import { AlbumService } from "@/services/albumBackendService";
import { requireAuthSession } from "@/lib/utils/session";
import { ForbiddenError } from "@/lib/errors/app-error";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const album = await AlbumService.getAlbumById(id);
    return successResponse(album);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can edit albums");
    }

    const { id } = await context.params;
    const body = await validateRequestBody(req, updateAlbumSchema);
    const updatedAlbum = await AlbumService.updateAlbum(id, body);
    return successResponse(updatedAlbum, "Album updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can delete albums");
    }

    const { id } = await context.params;
    await AlbumService.deleteAlbum(id);
    return successResponse(null, "Album deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
