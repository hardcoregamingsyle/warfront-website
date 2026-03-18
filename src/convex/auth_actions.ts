"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const RESEND_API_URL = "https://api.resend.com/emails";

type ResendSendArgs = {
  toEmail: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
  senderEmail?: string;
  senderName?: string;
};

async function resendSendEmail({
  toEmail,
  subject,
  html,
  text,
  senderEmail,
  senderName,
}: ResendSendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: RESEND_API_KEY environment variable is not set.");
    return false;
  }

  const fromEmail = senderEmail || "onboarding@mail.warfront.skinticals.com";
  const fromName = senderName || "Warfront";

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [toEmail],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Failed to send email via Resend:", res.status, errText);
      return false;
    }

    const data = await res.json().catch(() => null);
    console.log("Resend email sent successfully!", data);
    return true;
  } catch (exception) {
    console.error("An unexpected exception occurred while sending email via Resend:", exception);
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

    await resendSendEmail({
      senderEmail: "onboarding@mail.warfront.skinticals.com",
      senderName: "Warfront",
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

    await resendSendEmail({
      senderEmail: "support@mail.warfront.skinticals.com",
      senderName: "Warfront",
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
    await resendSendEmail({
      senderEmail: "no-reply@mail.warfront.skinticals.com",
      senderName: "Warfront",
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
    await resendSendEmail({
      senderEmail: "alert@mail.warfront.skinticals.com",
      senderName: "Warfront",
      toEmail: email,
      toName: name,
      subject,
      html: html ?? undefined,
      text: text ?? undefined,
    });
  },
});