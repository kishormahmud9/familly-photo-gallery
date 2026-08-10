import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { AuthService } from "@/services/authService";

export async function POST(_req: NextRequest) {
  try {
    await AuthService.logout();
    return successResponse(null, "Logout successful");
  } catch (error) {
    return handleApiError(error);
  }
}
