import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateQueryParams } from "@/lib/validators/validate";
import { photoQuerySchema } from "@/lib/validators/photo";
import { PhotoBackendService } from "@/services/photoBackendService";

export async function GET(req: NextRequest) {
  try {
    const query = validateQueryParams(req.url, photoQuerySchema);
    const result = await PhotoBackendService.getPhotos(query);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
