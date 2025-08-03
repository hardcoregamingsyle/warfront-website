"use node";
import { Resend } from "resend";
import { action } from "./_generated/server";
import { v } from "convex/values";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtp = action({
  args: {
    email: v.string(),
    otp: v.string(),
  },
  handler: async (_, { email, otp }) => {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your Warfront Verification Code",
      html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
    });
  },
});
