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
        console.log(`Sending verification email to ${email}`);

        try {
            const { data, error } = await resend.emails.send({
                from: 'Warfront <onboarding@resend.dev>',
                to: [email],
                subject: 'Verify your email address',
                html: `
                    <h1>Welcome to Warfront, ${name}!</h1>
                    <p>Click the link below to verify your email address and get started:</p>
                    <a href="${verificationUrl}">Verify Email</a>
                `,
            });

            if (error) {
                console.error(`Failed to send verification email to ${email}:`, JSON.stringify(error, null, 2));
                return;
            }

            console.log(`Successfully sent verification email to ${email}. Message ID: ${data?.id}`);
        } catch (error) {
            console.error(`Caught an exception while sending verification email to ${email}:`, error);
        }
    },
});