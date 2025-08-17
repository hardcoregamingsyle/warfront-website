"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { api, internal } from "./_generated/api";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.SITE_URL || "http://localhost:5173";

export const sendVerificationEmail = internalAction({
    args: { 
        email: v.string(),
        name: v.string(),
        token: v.string(),
     },
    handler: async (ctx, { email, name, token }) => {
        const verificationUrl = `${domain}/verify-email?token=${token}`;

        try {
            await resend.emails.send({
                from: 'Warfront Verification <onboarding@resend.dev>',
                to: [email],
                subject: 'Verify your email address',
                html: `
                    <h1>Welcome to Warfront, ${name}!</h1>
                    <p>Click the link below to verify your email address and get started:</p>
                    <a href="${verificationUrl}">Verify Email</a>
                `,
            });
        } catch (error) {
            console.error("Failed to send verification email:", error);
            // Optionally, you could add more robust error handling here
        }
    },
});