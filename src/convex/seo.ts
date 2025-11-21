"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";

const CLOUDFLARE_DEPLOY_HOOK = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/89fcc9eb-8276-4114-a3d2-39ff4950d1cf";

export const triggerBuild = action({
  args: {},
  handler: async () => {
    try {
      console.log("Triggering Cloudflare build...");
      const response = await fetch(CLOUDFLARE_DEPLOY_HOOK, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Cloudflare responded with ${response.status}`);
      }
      console.log("Successfully triggered Cloudflare build");
    } catch (e) {
      console.error("Failed to trigger Cloudflare build", e);
    }
  },
});

export const notifyIndexNow = action({
  args: { paths: v.array(v.string()) },
  handler: async (ctx, { paths }) => {
    const host = process.env.SITE_URL || "warfront.vly.site";
    // We assume the key is stored in an env var.
    // The user must also host this key at https://<host>/<key>.txt
    const key = process.env.INDEXNOW_KEY; 
    
    if (!key) {
        console.log("INDEXNOW_KEY environment variable not set. Skipping IndexNow notification.");
        return;
    }

    const keyLocation = `https://${host}/${key}.txt`;
    
    const urlList = paths.map(p => {
        const path = p.startsWith("/") ? p : `/${p}`;
        return `https://${host}${path}`;
    });

    const body = {
      host,
      key,
      keyLocation,
      urlList,
    };

    try {
      console.log(`Notifying IndexNow for ${urlList.length} URLs...`);
      const response = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
         console.error(`IndexNow responded with ${response.status}: ${await response.text()}`);
      } else {
         console.log("Successfully notified IndexNow");
      }
    } catch (e) {
      console.error("Failed to notify IndexNow", e);
    }
  },
});
