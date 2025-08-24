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
            console.error("CRITICAL: SITE_URL environment variable is not set. Cannot send verification email.");
            return;
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.error("CRITICAL: RESEND_API_KEY environment variable is not set. Cannot send verification email.");
            return;
        }

        const resend = new Resend(resendApiKey);
        const verificationUrl = `${siteUrl}/verify-email?token=${token}`;

        console.log(`Attempting to send verification email to: ${email}`);

        try {
            const { data, error } = await resend.emails.send({
                from: "Warfront Verification <onboarding@resend.dev>",
                to: [email], // Resend expects an array of strings
                subject: "Verify Your Warfront Account",
                html: `
                    <h1>Welcome to Warfront, ${name}!</h1>
                    <p>Click the link below to verify your email address and activate your account:</p>
                    <a href="${verificationUrl}" style="color: #ffffff; background-color: #ff0000; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                    <p>This link will expire in 24 hours.</p>
                    <hr />
                    <p>If you cannot click the button, copy and paste this link into your browser: ${verificationUrl}</p>
                `,
            });

            if (error) {
                console.error("Failed to send verification email. Resend API returned an error:", JSON.stringify(error, null, 2));
                return;
            }

            console.log("Email sent successfully!", JSON.stringify(data, null, 2));

        } catch (exception) {
            console.error("An unexpected exception occurred while sending the verification email:", exception);
        }
    },
});

export const sendPasswordResetEmail = internalAction({
    args: {
        email: v.string(),
        name: v.string(),
        token: v.string(),
    },
    handler: async (ctx, { email, name, token }) => {
        const siteUrl = process.env.SITE_URL;
        if (!siteUrl) {
            console.error("CRITICAL: SITE_URL environment variable is not set. Cannot send password reset email.");
            return;
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.error("CRITICAL: RESEND_API_KEY environment variable is not set. Cannot send password reset email.");
            return;
        }

        const resend = new Resend(resendApiKey);
        const resetUrl = `${siteUrl}/reset-password?token=${token}`;

        console.log(`Attempting to send password reset email to: ${email}`);

        try {
            const { data, error } = await resend.emails.send({
                from: "Warfront Password Reset <onboarding@resend.dev>",
                to: [email],
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
            });

            if (error) {
                console.error("Failed to send password reset email. Resend API returned an error:", JSON.stringify(error, null, 2));
                return;
            }

            console.log("Password reset email sent successfully!", JSON.stringify(data, null, 2));

        } catch (exception) {
            console.error("An unexpected exception occurred while sending the password reset email:", exception);
        }
    },
});