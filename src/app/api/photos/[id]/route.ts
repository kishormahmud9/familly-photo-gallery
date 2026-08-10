import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { updatePhotoSchema } from "@/lib/validators/photo";
import { PhotoBackendService } from "@/services/photoBackendService";
import { requireAuthSession } from "@/lib/utils/session";
import { ForbiddenError } from "@/lib/errors/app-error";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const photo = await PhotoBackendService.getPhotoById(id);
    return successResponse(photo);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can edit photo metadata");
    }

    const { id } = await context.params;
    const body = await validateRequestBody(req, updatePhotoSchema);
    const updatedPhoto = await PhotoBackendService.updatePhoto(id, body);
    return successResponse(updatedPhoto, "Photo updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can delete photos");
    }

    const { id } = await context.params;
    await PhotoBackendService.deletePhoto(id);
    return successResponse(null, "Photo deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
