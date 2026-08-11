import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { requestOtpSchema } from "@/lib/validators/auth";
import { AuthService } from "@/services/authService";

export async function POST(req: NextRequest) {
  try {
    const body = await validateRequestBody(req, requestOtpSchema);
    await AuthService.requestPasswordResetOTP(body.email);
    return successResponse(null, "OTP sent successfully to your email address");
  } catch (error) {
    return handleApiError(error);
  }
}
