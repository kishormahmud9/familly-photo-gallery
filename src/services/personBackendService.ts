import "server-only";
import { PersonRepository } from "@/repositories/personRepository";
import { CreatePersonInput, UpdatePersonInput } from "@/lib/validators/person";
import { NotFoundError } from "@/lib/errors/app-error";
import { Person } from "@/generated/prisma/client";
import { CloudinaryStorage } from "@/lib/storage/cloudinary";

export class PersonService {
  static async getPeople(): Promise<Person[]> {
    return PersonRepository.findAll();
  }

  static async getPersonById(id: string): Promise<Person> {
    const person = await PersonRepository.findById(id);
    if (!person) throw new NotFoundError("Family member profile not found");
    return person;
  }

  static async createPerson(input: CreatePersonInput): Promise<Person> {
    try {
      return await PersonRepository.create(input);
    } catch (err) {
      // DB create failed — clean up orphan Cloudinary avatar
      if (input.cloudinaryPublicId) {
        await CloudinaryStorage.deleteImage(input.cloudinaryPublicId).catch((e) =>
          console.error("⚠️ Orphan avatar Cloudinary cleanup failed:", e)
        );
      }
      throw err;
    }
  }

  static async updatePerson(
    id: string,
    input: UpdatePersonInput,
    oldPublicId?: string | null
  ): Promise<Person> {
    const existing = await PersonRepository.findById(id);
    if (!existing) throw new NotFoundError("Family member profile not found");

    try {
      const updated = await PersonRepository.update(id, input);

      // Only after successful DB update, delete the old Cloudinary avatar.
      if (
        oldPublicId &&
        input.cloudinaryPublicId &&
        input.cloudinaryPublicId !== oldPublicId
      ) {
        await CloudinaryStorage.deleteImage(oldPublicId).catch((e) =>
          console.error("⚠️ Old avatar Cloudinary cleanup failed:", e)
        );
      }

      return updated;
    } catch (err) {
      // DB update failed — rollback newly uploaded avatar
      if (input.cloudinaryPublicId && input.cloudinaryPublicId !== oldPublicId) {
        await CloudinaryStorage.deleteImage(input.cloudinaryPublicId).catch((e) =>
          console.error("⚠️ New avatar Cloudinary rollback failed:", e)
        );
      }
      throw err;
    }
  }

  static async deletePerson(id: string): Promise<void> {
    const existing = await PersonRepository.findById(id);
    if (!existing) throw new NotFoundError("Family member profile not found");

    const avatarPublicId = existing.cloudinaryPublicId;
    await PersonRepository.delete(id);

    // Clean up Cloudinary avatar after successful DB deletion
    if (avatarPublicId) {
      await CloudinaryStorage.deleteImage(avatarPublicId).catch((e) =>
        console.error("⚠️ Deleted person avatar Cloudinary cleanup failed:", e)
      );
    }
  }
}
