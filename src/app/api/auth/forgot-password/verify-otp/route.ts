import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { verifyOtpSchema } from "@/lib/validators/auth";
import { AuthService } from "@/services/authService";

export async function POST(req: NextRequest) {
  try {
    const body = await validateRequestBody(req, verifyOtpSchema);
    await AuthService.verifyPasswordResetOTP(body.email, body.otp);
    return successResponse(null, "OTP verified successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
