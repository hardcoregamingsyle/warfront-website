"use node";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";
import { v } from "convex/values";

export const sendVerificationEmail = internalAction({
    args: {
        email: v.string(),
        name: v.string(),
        token: v.string(),
    },
    handler: async (ctx, { email, name, token }) => {
        const siteUrl = process.env.SITE_URL;
        if (!siteUrl) {
            console.error("SITE_URL environment variable is not set. Cannot send verification email.");
            return;
        }

        const resend = new Resend(process.env.RESEND_API_KEY!);
        const verificationUrl = `${siteUrl}/verify-email?token=${token}`;

        try {
            // Note: To send emails, your domain must be verified in Resend.
            // The `onboarding@resend.dev` is a special address for testing.
            await resend.emails.send({
                from: "Warfront <onboarding@resend.dev>",
                to: email,
                subject: "Verify Your Warfront Account",
                html: `
                    <h1>Welcome to Warfront, ${name}!</h1>
                    <p>Click the link below to verify your email address and activate your account:</p>
                    <a href="${verificationUrl}">Verify Email</a>
                    <p>This link will expire in 24 hours.</p>
                `,
            });
        } catch (error) {
            console.error("Failed to send verification email:", error);
            // It's often better to not throw here so the signup flow doesn't fail,
            // but to log the error for debugging. The user can use the "resend" button.
        }
    },
});