import { Resend } from "resend"

/**
 * Email Service
 *
 * Handles all transactional email sending via Resend.
 * Centralized here to keep email logic out of business services.
 */

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends a password reset email to the user.
 * Includes a link with the reset token — expires in 1 hour.
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
): Promise<void> => {
  await resend.emails.send({
    from: "Fintrack <onboarding@resend.dev>",
    to: email,
    subject: "Reset your password",
    html: `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="margin-bottom:8px;">Reset your password</h2>
      <p>We received a request to reset your Fintrack password.</p>
      <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td style="background-color:#6366f1;border-radius:6px;padding:12px 24px;">
            <a href="${resetUrl}" style="color:#ffffff;text-decoration:none;font-weight:600;display:inline-block;">
              Reset password
            </a>
          </td>
        </tr>
      </table>
      <p style="color:#6b7280;font-size:14px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
`
  })
}