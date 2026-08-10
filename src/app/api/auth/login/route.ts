import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { loginSchema } from "@/lib/validators/auth";
import { AuthService } from "@/services/authService";

export async function POST(req: NextRequest) {
  try {
    const body = await validateRequestBody(req, loginSchema);
    const admin = await AuthService.login(body);
    return successResponse({ admin }, "Login successful");
  } catch (error) {
    return handleApiError(error);
  }
}
