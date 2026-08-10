import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { bulkMovePhotosSchema } from "@/lib/validators/photo";
import { PhotoBackendService } from "@/services/photoBackendService";
import { requireAuthSession } from "@/lib/utils/session";
import { ForbiddenError } from "@/lib/errors/app-error";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can relocate photos");
    }

    const body = await validateRequestBody(req, bulkMovePhotosSchema);
    const result = await PhotoBackendService.bulkMovePhotos(body);
    return successResponse(result, `Relocated ${result.count} photos successfully`);
  } catch (error) {
    return handleApiError(error);
  }
}
