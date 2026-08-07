// lib/email.ts
import { Resend } from "resend";
import { recordEmailSent } from "@/lib/systemSettings";

const resend = new Resend(process.env.RESEND_API_KEY);
const DEFAULT_FROM_EMAIL = "notifications@realtor.regalpdc.com";

function getBrandedFromAddress() {
  const configuredFrom = process.env.EMAIL_FROM?.trim() || DEFAULT_FROM_EMAIL;

  if (configuredFrom.includes("<") && configuredFrom.includes(">")) {
    return configuredFrom;
  }

  return `Regal PDC Realtor <${configuredFrom}>`;
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: getBrandedFromAddress(),
    to: email,
    subject: "Verify your email",
    html: `
      <p>Welcome! Please verify your email address to activate your account.</p>
      <p><a href="${url}">Click here to verify your email</a></p>
      <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
    `,
  });

  if (error) {
    console.error("Resend failed to send verification email", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  await recordEmailSent();
  console.log("Verification email sent", { id: data?.id });
  return data;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: getBrandedFromAddress(),
    to: email,
    subject: "Reset your password",
    html: `
      <p>We received a request to reset your password.</p>
      <p><a href="${url}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error("Resend failed to send password reset email", error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }

  await recordEmailSent();
  console.log("Password reset email sent", { id: data?.id });
  return data;
}

export async function sendReferralNotificationEmail(
  email: string,
  referredName: string
) {
  const { data, error } = await resend.emails.send({
    from: getBrandedFromAddress(),
    to: email,
    subject: "You have a new referral!",
    html: `
      <p><strong>${referredName}</strong> just signed up using your referral link.</p>
      <p>You'll earn commission once their deal closes. Track your referrals from your dashboard.</p>
    `,
  });

  if (error) {
    console.error("Resend failed to send referral notification email", error);
    // Don't throw — a failed notification shouldn't fail the registration itself
    return null;
  }

  await recordEmailSent();
  console.log("Referral notification email sent", { id: data?.id });
  return data;
}

export async function sendContactEmail(
  toEmail: string,
  subject: string,
  html: string
) {
  const { data, error } = await resend.emails.send({
    from: getBrandedFromAddress(),
    to: toEmail,
    subject,
    html,
  });

  if (error) {
    console.error("Resend failed to send contact email", error);
    throw new Error(`Failed to send contact email: ${error.message}`);
  }

  await recordEmailSent();
  console.log("Contact email sent", { id: data?.id });
  return data;
}

export async function sendUnverifiedCleanupWarningEmail(email: string) {
  const { data, error } = await resend.emails.send({
    from: getBrandedFromAddress(),
    to: email,
    subject: "NIN verification required",
    html: `
      <p>Your Regal PDC Realtor account has not yet been verified with NIN.</p>
      <p>If your account remains unverified and inactive for 7 days, it will be automatically deleted.</p>
      <p>No worries, you're always welcome to register again whenever you're ready and able to complete NIN verification.</p>
      <p>Thank you,</p>
      <p>The Regal PDC Team</p>
    `,
  });

  if (error) {
    console.error("Resend failed to send cleanup warning email", error);
    throw new Error(`Failed to send cleanup warning email: ${error.message}`);
  }

  await recordEmailSent();
  console.log("Cleanup warning email sent", { id: data?.id, email });
  return data;
}
