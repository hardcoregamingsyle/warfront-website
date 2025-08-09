"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = internalAction({
  args: {
    email: v.string(),
    otp: v.string(),
  },
  handler: async (_, { email, otp }) => {
    try {
      await resend.emails.send({
        from: "Warfront <onboarding@resend.dev>",
        to: email,
        subject: "Your Warfront Verification Code",
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
      });
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      // Not throwing error to not fail the whole signup process if email fails
      // but in a real app you might want to handle this more gracefully
    }
  },
});
