import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { bulkDeletePhotosSchema } from "@/lib/validators/photo";
import { PhotoBackendService } from "@/services/photoBackendService";
import { requireAuthSession } from "@/lib/utils/session";
import { ForbiddenError } from "@/lib/errors/app-error";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can bulk delete photos");
    }

    const body = await validateRequestBody(req, bulkDeletePhotosSchema);
    const result = await PhotoBackendService.bulkDeletePhotos(body);
    return successResponse(result, "Bulk delete processing completed");
  } catch (error) {
    return handleApiError(error);
  }
}
