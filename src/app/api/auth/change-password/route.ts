import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { changePasswordSchema } from "@/lib/validators/auth";
import { AuthService } from "@/services/authService";
import { requireAuthSession } from "@/lib/utils/session";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await validateRequestBody(req, changePasswordSchema);
    await AuthService.changePassword(session.id, body);
    return successResponse(null, "Password changed successfully. Please log in again.");
  } catch (error) {
    return handleApiError(error);
  }
}
