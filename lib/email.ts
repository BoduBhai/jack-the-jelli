import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function renderEmailHtml(
  heading: string,
  bodyText: string,
  actionLabel: string,
  url: string,
) {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
      <h1 style="font-size: 20px; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 24px;">Jack The Jelli</h1>
      <h2 style="font-size: 18px; font-weight: normal; margin-bottom: 16px;">${heading}</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #444; margin-bottom: 24px;">${bodyText}</p>
      <a href="${url}" style="display: inline-block; background: #1a1a1a; color: #f9f8f6; text-decoration: none; padding: 14px 28px; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">${actionLabel}</a>
      <p style="font-size: 12px; color: #8a7968; margin-top: 32px;">If the button doesn't work, copy this link: ${url}</p>
    </div>
  `;
}

interface SendAuthEmailParams {
  to: string;
  subject: string;
  heading: string;
  bodyText: string;
  actionLabel: string;
  url: string;
}

/**
 * Transport switch: onboarding@resend.dev can only deliver to the Resend
 * account holder's own address (DEV_INBOX) — a 403 otherwise. Outside
 * production, anything sent to another address is logged instead of network
 * calls, so the rest of the app's test accounts can still "register" without
 * an error. See AUTH_IMPLEMENTATION_PLAN.md §6 Phase B.
 */
async function sendAuthEmail({
  to,
  subject,
  heading,
  bodyText,
  actionLabel,
  url,
}: SendAuthEmailParams) {
  const isProduction = process.env.NODE_ENV === "production";
  const isDevInbox = to === process.env.DEV_INBOX;

  if (!isProduction && !isDevInbox) {
    console.log(`[email:dev] ${heading.toLowerCase()} link for ${to} → ${url}`);
    return;
  }

  const from = process.env.EMAIL_FROM;
  if (!process.env.RESEND_API_KEY || !from) {
    throw new Error(
      "Email is not configured — set RESEND_API_KEY and EMAIL_FROM.",
    );
  }

  // The Resend SDK resolves with { data, error } rather than rejecting, so an
  // unchecked `await` reports success for a 403 (sending domain not verified,
  // or onboarding@resend.dev aimed at anyone but the account holder), a bad
  // API key, or a quota trip. Better Auth then tells the user to check an
  // inbox nothing was ever sent to, with nothing logged anywhere.
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html: renderEmailHtml(heading, bodyText, actionLabel, url),
  });

  if (error) {
    console.error(
      `[email] Resend rejected "${subject}" to ${to}: ${error.name} — ${error.message}`,
    );
    // Thrown, not swallowed: on the resend endpoints Better Auth awaits this
    // directly and turns it into a client-visible error. On sign-up it runs as
    // a background task, so this only reaches the server log — which is still
    // the difference between a diagnosable failure and a silent one.
    throw new Error(`Could not send email: ${error.message}`);
  }
}

export async function sendVerificationEmail(to: string, url: string) {
  return sendAuthEmail({
    to,
    subject: "Verify your email — Jack The Jelli",
    heading: "Verify your email",
    bodyText:
      "Confirm your email address to finish creating your Jack The Jelli account.",
    actionLabel: "Verify Email",
    url,
  });
}

export async function sendPasswordResetEmail(to: string, url: string) {
  return sendAuthEmail({
    to,
    subject: "Reset your password — Jack The Jelli",
    heading: "Reset your password",
    bodyText:
      "We received a request to reset your Jack The Jelli password. If this wasn't you, ignore this email.",
    actionLabel: "Reset Password",
    url,
  });
}
