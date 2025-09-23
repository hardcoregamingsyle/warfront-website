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
                from: "Warfront Verification <warfront-verificaton@mail.skinticals.com>",
                to: [email],
                subject: "Verify your Warfront Account",
                text: `Please verify your Warfront Account by clicking here: ${verificationUrl}

If that link doesn't work then please copy the link below and paste it in your browser:
${verificationUrl}

If you still face any problem then please contact hardcorgamingstyle@gmail.com with your Account name, Email, and proof that you are not a bot and you own the Email.`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
                      <h1 style="margin: 0 0 12px; color: #d32f2f;">Verify your Warfront Account</h1>
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