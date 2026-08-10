import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { createPersonSchema } from "@/lib/validators/person";
import { PersonService } from "@/services/personBackendService";
import { requireAuthSession } from "@/lib/utils/session";
import { ForbiddenError } from "@/lib/errors/app-error";

export async function GET() {
  try {
    const people = await PersonService.getPeople();
    return successResponse(people);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can create family member profiles");
    }

    const body = await validateRequestBody(req, createPersonSchema);
    const person = await PersonService.createPerson(body);
    return successResponse(person, "Family member profile created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
