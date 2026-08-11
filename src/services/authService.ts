import "server-only";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, hashPassword } from "@/lib/utils/password";
import { createSession, clearSession, SessionPayload } from "@/lib/utils/session";
import { UnauthorizedError, ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { LoginInput, ChangePasswordInput, ResetPasswordWithOtpInput } from "@/lib/validators/auth";
import { sendOtpEmail } from "@/lib/email/transporter";

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

  static async requestPasswordResetOTP(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      throw new NotFoundError("No admin account registered with this email");
    }

    // Generate random 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await hashPassword(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clean up older OTPs for this email
    await prisma.passwordResetOTP.deleteMany({
      where: { email: normalizedEmail },
    });

    // Save new OTP record
    await prisma.passwordResetOTP.create({
      data: {
        email: normalizedEmail,
        otpHash,
        expiresAt,
      },
    });

    // Send Email
    await sendOtpEmail(normalizedEmail, rawOtp);
  }

  static async verifyPasswordResetOTP(email: string, otp: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase();
    const record = await prisma.passwordResetOTP.findFirst({
      where: {
        email: normalizedEmail,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw new ValidationError("OTP expired or invalid request. Please request a new OTP.");
    }

    const isValid = await verifyPassword(otp, record.otpHash);
    if (!isValid) {
      throw new ValidationError("Invalid 6-digit OTP code");
    }

    return true;
  }

  static async resetPasswordWithOTP(input: ResetPasswordWithOtpInput): Promise<void> {
    const normalizedEmail = input.email.toLowerCase();

    // Verify OTP first
    await this.verifyPasswordResetOTP(normalizedEmail, input.otp);

    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      throw new NotFoundError("Admin account not found");
    }

    // Hash new password
    const newHashedPassword = await hashPassword(input.newPassword);

    // Update password
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: newHashedPassword },
    });

    // Remove used OTPs
    await prisma.passwordResetOTP.deleteMany({
      where: { email: normalizedEmail },
    });
  }
}

