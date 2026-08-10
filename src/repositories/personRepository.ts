import "server-only";
import { prisma } from "@/lib/db/prisma";
import { Person, Prisma } from "@/generated/prisma/client";
import { CreatePersonInput, UpdatePersonInput } from "@/lib/validators/person";

export class PersonRepository {
  static async findAll(): Promise<Person[]> {
    return prisma.person.findMany({ orderBy: { name: "asc" } });
  }

  static async findById(id: string): Promise<Person | null> {
    return prisma.person.findUnique({ where: { id } });
  }

  static async create(data: CreatePersonInput): Promise<Person> {
    return prisma.person.create({
      data: {
        name: data.name,
        role: data.role ?? null,
        bio: data.bio ?? null,
        birthYear: data.birthYear ?? null,
        avatarUrl: data.avatarUrl && data.avatarUrl.length > 0 ? data.avatarUrl : null,
        cloudinaryPublicId: data.cloudinaryPublicId ?? null,
      },
    });
  }

  static async update(id: string, data: UpdatePersonInput): Promise<Person> {
    const updateData: Prisma.PersonUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role ?? null;
    if (data.bio !== undefined) updateData.bio = data.bio ?? null;
    if (data.birthYear !== undefined) updateData.birthYear = data.birthYear ?? null;
    if (data.avatarUrl !== undefined)
      updateData.avatarUrl = data.avatarUrl && data.avatarUrl.length > 0 ? data.avatarUrl : null;
    if (data.cloudinaryPublicId !== undefined)
      updateData.cloudinaryPublicId = data.cloudinaryPublicId ?? null;

    return prisma.person.update({ where: { id }, data: updateData });
  }

  static async delete(id: string): Promise<Person> {
    return prisma.person.delete({ where: { id } });
  }
}
