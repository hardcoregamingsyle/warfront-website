"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

// Cloudflare Pages Deploy Hook
const DEPLOY_HOOK_URL = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/89fcc9eb-8276-4114-a3d2-39ff4950d1cf";
const SITE_URL = "https://warfront.vly.site";
const INDEXNOW_KEY = "4321432143214321"; // Replace with your actual IndexNow key
const INDEXNOW_KEY_LOCATION = `https://warfront.vly.site/${INDEXNOW_KEY}.txt`;

export const triggerBuild = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Triggering Cloudflare Pages build...");
    try {
      const res = await fetch(DEPLOY_HOOK_URL, { method: "POST" });
      if (res.ok) {
        console.log("Build triggered successfully");
      } else {
        console.error("Failed to trigger build", await res.text());
      }
    } catch (e) {
      console.error("Error triggering build", e);
    }
  },
});

export const notifyIndexNow = internalAction({
  args: { paths: v.array(v.string()) },
  handler: async (ctx, { paths }) => {
    const urlList = paths.map((path) => {
        // Ensure path starts with / and append to site URL
        const p = path.startsWith("/") ? path : `/${path}`;
        return `${SITE_URL}${p}`;
    });

    console.log("Notifying IndexNow for:", urlList);

    const body = {
      host: "warfront.vly.site",
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList,
    };

    try {
      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        console.log("IndexNow notification sent successfully");
      } else {
        console.error("IndexNow notification failed", await res.text());
      }
    } catch (e) {
      console.error("Error notifying IndexNow", e);
    }
  },
});