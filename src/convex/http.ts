import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/verify-email",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return new Response("Token not found in URL", { status: 400 });
        }

        const verificationToken = await ctx.runQuery("users:getVerificationToken" as any, { token });

        if (!verificationToken) {
            return new Response("Invalid verification token", { status: 400 });
        }

        if (verificationToken.expires < Date.now()) {
            return new Response("Verification token expired", { status: 400 });
        }

        await ctx.runMutation("users:verifyEmail" as any, { 
            userId: verificationToken.userId,
            tokenId: verificationToken._id,
        });
        
        // Redirect to a success page
        const siteUrl = process.env.SITE_URL || "http://localhost:5173";
        return new Response(null, {
            status: 302,
            headers: {
                Location: `${siteUrl}/email-verified`,
            },
        });
    }),
});

export default http;