/**
 * Email service stub.
 * Console-logs all emails until SMTP credentials are configured.
 *
 * @architecture Abstracted interface so we can swap to Resend/Nodemailer/SMTP
 * without changing calling code.
 *
 * TODO: Wire up actual email provider when SMTP credentials are available.
 */

interface EmailPayload {
  /** Recipient email address. */
  to: string;
  /** Email subject line. */
  subject: string;
  /** HTML email body. */
  html: string;
  /** Optional plain-text fallback. */
  text?: string;
}

/**
 * Sends an email. Currently stubbed — logs to console.
 * Replace implementation when SMTP is configured.
 */
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean }> {
  if (process.env.SMTP_HOST) {
    // TODO: Replace with actual SMTP/Resend integration
    console.warn("[EMAIL] SMTP configured but not yet integrated");
  }

  console.info("[EMAIL_STUB] Would send email:", {
    to: payload.to,
    subject: payload.subject,
    bodyLength: payload.html.length,
  });

  return { success: true };
}

/**
 * Sends a password reset email with a tokenized link.
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
): Promise<{ success: boolean }> {
  const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password/confirm?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: "Reset Your SubsMS Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
        <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

/**
 * Sends a welcome email to newly registered users.
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string,
): Promise<{ success: boolean }> {
  return sendEmail({
    to: email,
    subject: "Welcome to SubsMS!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${userName}!</h2>
        <p>Your account has been created successfully. You can now:</p>
        <ul>
          <li>Browse and subscribe to plans</li>
          <li>Manage your subscriptions</li>
          <li>View invoices and payment history</li>
        </ul>
        <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/login" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Log In
        </a>
      </div>
    `,
  });
}
