import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { resetPasswordWithOtpSchema } from "@/lib/validators/auth";
import { AuthService } from "@/services/authService";

export async function POST(req: NextRequest) {
  try {
    const body = await validateRequestBody(req, resetPasswordWithOtpSchema);
    await AuthService.resetPasswordWithOTP(body);
    return successResponse(null, "Password reset successfully. You can now login with your new password.");
  } catch (error) {
    return handleApiError(error);
  }
}
