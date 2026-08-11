import "server-only";
import nodemailer from "nodemailer";

export async function sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Family Photo Gallery" <${user || "noreply@gallery.com"}>`;

  // Fallback log for development mode if SMTP is not fully configured
  if (!host || !user || !pass || user === "your-email@gmail.com") {
    console.warn("\n==================================================");
    console.warn("⚠️ [SMTP CONFIG MISSING] Email sending bypassed!");
    console.warn(`📩 Target Email: ${toEmail}`);
    console.warn(`🔑 OTP Code: ${otp}`);
    console.warn("==================================================\n");
    return true; // Return true so developer can test locally using console logs
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #09090b; color: #f4f4f5; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; background-color: #fbbf24; border-radius: 12px; line-height: 48px; font-size: 24px; color: #09090b;">
            📷
          </div>
          <h2 style="color: #ffffff; margin-top: 12px; margin-bottom: 4px; font-size: 20px; font-weight: 700;">Archive Admin Security</h2>
          <p style="color: #fbbf24; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0; font-family: monospace;">Family Photo Gallery</p>
        </div>

        <div style="background-color: #18181b; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); text-align: center; margin-bottom: 24px;">
          <p style="color: #a1a1aa; font-size: 14px; margin-top: 0; margin-bottom: 16px;">
            A password reset request was issued for your admin account. Use the One-Time Password (OTP) below to complete the verification:
          </p>
          
          <div style="background-color: #09090b; display: inline-block; padding: 14px 28px; border-radius: 10px; border: 1px solid #fbbf24; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #fbbf24; font-family: monospace;">
            ${otp}
          </div>

          <p style="color: #71717a; font-size: 12px; margin-top: 16px; margin-bottom: 0;">
            This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
        </div>

        <p style="color: #52525b; font-size: 11px; text-align: center; margin: 0;">
          If you did not request a password reset, please ignore this email or check your admin security credentials immediately.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: "🔑 Your Password Reset OTP - Family Photo Gallery Admin",
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("❌ Failed to send OTP email via SMTP:", error);
    throw new Error("Failed to send OTP email. Please verify SMTP configuration.");
  }
}
