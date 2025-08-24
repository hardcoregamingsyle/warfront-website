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
        const resend = new Resend(process.env.RESEND_API_KEY!);
        const domain = process.env.VITE_CONVEX_URL?.replace(/.prod.convex.cloud/, "");

        const verificationUrl = `${domain}/verify-email?token=${token}`;

        try {
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