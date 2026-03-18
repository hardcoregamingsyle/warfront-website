"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { BrevoClient } from "@getbrevo/brevo";

function createBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("CRITICAL: BREVO_API_KEY environment variable is not set.");
  }
  return new BrevoClient({ apiKey });
}

type BrevoSendArgs = {
  toEmail: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
};

async function brevoSendEmail({
  toEmail,
  toName,
  subject,
  html,
  text,
}: BrevoSendArgs): Promise<boolean> {
  try {
    const client = createBrevoClient();
    const senderEmailAddr = "onboarding@mail.warfront.skinticals.com";
    const senderNameStr = "Warfront Onboarding";

    const emailPayload: any = {
      sender: { email: senderEmailAddr, name: senderNameStr },
      to: [{ email: toEmail, name: toName || toEmail }],
      subject,
    };

    if (html) emailPayload.htmlContent = html;
    if (text) emailPayload.textContent = text;

    console.log(`[Brevo] Sending email to: ${toEmail}, subject: "${subject}", sender: ${senderEmailAddr}`);

    const result = await client.transactionalEmails.sendTransacEmail(emailPayload);
    console.log("[Brevo] Email sent successfully!", JSON.stringify(result));
    return true;
  } catch (error: any) {
    console.error("[Brevo] FAILED to send email!");
    console.error("[Brevo] Error name:", error?.name);
    console.error("[Brevo] Status code:", error?.statusCode);
    console.error("[Brevo] Body:", JSON.stringify(error?.body));
    console.error("[Brevo] Message:", error?.message);
    return false;
  }
}

export const sendVerificationEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    token: v.string(),
  },
  handler: async (ctx, { email, name, token }) => {
    const siteUrl = process.env.SITE_URL || "https://warfront.skinticals.com";
    const verificationUrl = `${siteUrl}/#/verify-email?token=${token}`;

    console.log(`Attempting to send verification email to: ${email}`);

    await brevoSendEmail({
      toEmail: email,
      toName: name,
      subject: "Verify your Warfront Account",
      text: `Please verify your Warfront Account by clicking here: ${verificationUrl}\n\nIf that link doesn't work then please copy the link below and paste it in your browser:\n${verificationUrl}\n\nIf you still face any problem then please contact hardcorgamingstyle@gmail.com with your Account name, Email, and proof that you are not a bot and you own the Email.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <h1 style="margin: 0 0 12px; color: #d32f2f;">Verify your Warfront Account</h1>
          <p>Hello ${name},</p>
          <p>Please verify your Warfront Account by <a href="${verificationUrl}" style="color: #d32f2f; text-decoration: underline;">clicking here</a>.</p>
          <p>If that link doesn't work then please copy the link below and paste it in your browser:</p>
          <p><a href="${verificationUrl}" style="color: #0a66c2; word-break: break-all;">${verificationUrl}</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p>If you still face any problem then please contact
            <a href="mailto:hardcorgamingstyle@gmail.com">hardcorgamingstyle@gmail.com</a>
            with your Account name, Email, and proof that you are not a bot and you own the Email.
          </p>
        </div>
      `,
    });
  },
});

export const sendPasswordResetEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    token: v.string(),
  },
  handler: async (ctx, { email, name, token }) => {
    const siteUrl = process.env.SITE_URL || "https://warfront.skinticals.com";
    const resetUrl = `${siteUrl}/#/reset-password?token=${token}`;

    console.log(`Attempting to send password reset email to: ${email}`);

    await brevoSendEmail({
      toEmail: email,
      toName: name,
      subject: "Reset Your Warfront Password",
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello ${name},</p>
        <p>You requested to reset your password for your Warfront account. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="color: #ffffff; background-color: #ff0000; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <hr />
        <p>If you cannot click the button, copy and paste this link into your browser: ${resetUrl}</p>
      `,
      text: `Password Reset Request\n\nHello ${name},\n\nYou requested to reset your password for your Warfront account. Open this link to set a new password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this password reset, please ignore this email.`,
    });
  },
});

export const sendNotificationEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    subject: v.string(),
    html: v.union(v.string(), v.null()),
    text: v.union(v.string(), v.null()),
  },
  handler: async (ctx, { email, name, subject, html, text }) => {
    console.log(`Sending notification email to: ${email}`);
    await brevoSendEmail({
      toEmail: email,
      toName: name,
      subject,
      html: html ?? undefined,
      text: text ?? undefined,
    });
  },
});

export const sendAlertEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    subject: v.string(),
    html: v.union(v.string(), v.null()),
    text: v.union(v.string(), v.null()),
  },
  handler: async (ctx, { email, name, subject, html, text }) => {
    console.log(`Sending alert email to: ${email}`);
    await brevoSendEmail({
      toEmail: email,
      toName: name,
      subject,
      html: html ?? undefined,
      text: text ?? undefined,
    });
  },
});