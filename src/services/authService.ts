import "server-only";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, hashPassword } from "@/lib/utils/password";
import { createSession, clearSession, SessionPayload } from "@/lib/utils/session";
import { UnauthorizedError, ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { LoginInput, ChangePasswordInput } from "@/lib/validators/auth";

export class AuthService {
  static async login(input: LoginInput): Promise<SessionPayload> {
    const admin = await prisma.admin.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!admin) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValid = await verifyPassword(input.password, admin.password);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const sessionPayload: SessionPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    await createSession(sessionPayload);
    return sessionPayload;
  }

  static async logout(): Promise<void> {
    await clearSession();
  }

  static async changePassword(adminId: string, input: ChangePasswordInput): Promise<void> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundError("Admin account not found");
    }

    const isValid = await verifyPassword(input.currentPassword, admin.password);
    if (!isValid) {
      throw new ValidationError("Current password is incorrect");
    }

    const newHashedPassword = await hashPassword(input.newPassword);

    await prisma.admin.update({
      where: { id: adminId },
      data: { password: newHashedPassword },
    });

    await clearSession();
  }
}
