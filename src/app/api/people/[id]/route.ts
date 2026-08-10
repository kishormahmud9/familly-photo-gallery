import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/utils/api-response";
import { validateRequestBody } from "@/lib/validators/validate";
import { updatePersonSchema } from "@/lib/validators/person";
import { PersonService } from "@/services/personBackendService";
import { requireAuthSession } from "@/lib/utils/session";
import { ForbiddenError } from "@/lib/errors/app-error";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const person = await PersonService.getPersonById(id);
    return successResponse(person);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can edit family member profiles");
    }

    const { id } = await params;
    const body = await validateRequestBody(req, updatePersonSchema);

    // Fetch existing person to get old cloudinaryPublicId for safe image replacement
    const existing = await PersonService.getPersonById(id);
    const oldPublicId = existing.cloudinaryPublicId;

    const updated = await PersonService.updatePerson(id, body, oldPublicId);
    return successResponse(updated, "Family member profile updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuthSession();
    if (session.role !== "ADMIN") {
      throw new ForbiddenError("Only administrators can delete family member profiles");
    }

    const { id } = await params;
    await PersonService.deletePerson(id);
    return successResponse({ id }, "Family member profile deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
