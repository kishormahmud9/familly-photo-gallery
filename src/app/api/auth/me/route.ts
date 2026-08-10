import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { getSession } from "@/lib/utils/session";
import { UnauthorizedError } from "@/lib/errors/app-error";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError("Not authenticated");
    }
    return successResponse({ admin: session });
  } catch (error) {
    return handleApiError(error);
  }
}
