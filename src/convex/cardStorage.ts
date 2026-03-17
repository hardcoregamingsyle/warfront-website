"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

type WorkerConfig = {
  baseUrl: string;
  token: string;
  accessId: string;
};

type StoredCard = Doc<"cards">;
type HydratedCard = StoredCard & {
  imageUrl: string | null;
};

function getWorkerConfig(): WorkerConfig | null {
  const baseUrl = process.env.CLOUDFLARE_WORKER_URL;
  const token = process.env.CLOUDFLARE_WORKER_TOKEN;
  const accessId = process.env.CLOUDFLARE_API_ACCESS_ID;

  if (!baseUrl || !token || !accessId) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    token,
    accessId,
  };
}

function getCardDetailKey(customId: string) {
  return `cards/${customId}/detail.json`;
}

function getCardDetailUrl(config: WorkerConfig, customId: string) {
  const key = encodeURIComponent(getCardDetailKey(customId));
  return `${config.baseUrl}/cards/${encodeURIComponent(customId)}?key=${key}`;
}

function getWorkerHeaders(
  config: WorkerConfig,
  options?: { json?: boolean; extra?: Record<string, string> }
) {
  return {
    Authorization: `Bearer ${config.token}`,
    "X-Worker-Token": config.token,
    "CF-Access-Client-Id": config.accessId,
    "X-Cloudflare-Access-Id": config.accessId,
    ...(options?.json ? { "Content-Type": "application/json" } : {}),
    ...(options?.extra ?? {}),
  };
}

async function readCardDetailFromWorker(
  config: WorkerConfig,
  customId: string
) {
  const response = await fetch(getCardDetailUrl(config, customId), {
    method: "GET",
    headers: getWorkerHeaders(config),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Worker read failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload?.value ?? payload?.data ?? payload ?? null;
}

async function writeCardDetailToWorker(
  config: WorkerConfig,
  customId: string,
  payload: unknown
) {
  const response = await fetch(getCardDetailUrl(config, customId), {
    method: "PUT",
    headers: getWorkerHeaders(config, { json: true }),
    body: JSON.stringify({
      key: getCardDetailKey(customId),
      value: payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Worker write failed with status ${response.status}`);
  }
}

async function deleteCardObjectsFromWorker(
  config: WorkerConfig,
  customId: string
) {
  const response = await fetch(getCardDetailUrl(config, customId), {
    method: "DELETE",
    headers: getWorkerHeaders(config),
  });

  if (response.status === 404) {
    return;
  }

  if (!response.ok) {
    throw new Error(`Worker delete failed with status ${response.status}`);
  }
}

// Load a card from KV into Convex cache (RAM), return the hydrated card
export const loadCard: ReturnType<typeof action> = action({
  args: { customId: v.string() },
  handler: async (ctx, { customId }): Promise<HydratedCard | null> => {
    // Check if already in Convex cache
    const cached = (await ctx.runQuery(internal.cardCache.getCachedCard, {
      customId,
    })) as HydratedCard | null;

    if (cached) {
      return cached;
    }

    const worker = getWorkerConfig();

    if (worker) {
      // Try to load from KV (permanent storage)
      const kvCard = (await readCardDetailFromWorker(
        worker,
        customId
      )) as Partial<StoredCard> | null;

      if (kvCard) {
        // Write to Convex cache (RAM)
        await ctx.runMutation(internal.cardCache.cacheCard, {
          cardData: kvCard as StoredCard,
        });

        // Get image URL from Convex storage if imageId exists
        const imageUrl =
          kvCard.imageId
            ? ((await ctx.runQuery(api.cards.get, { customId })) as HydratedCard | null)?.imageUrl ?? null
            : null;

        return { ...(kvCard as StoredCard), imageUrl };
      }
    }

    // Fallback: load from Convex DB directly
    const shell = (await ctx.runQuery(api.cards.get, {
      customId,
    })) as HydratedCard | null;

    if (shell && worker) {
      // Sync to KV for future loads
      const rawCard = (await ctx.runQuery(internal.cards.getForR2Sync, {
        cardId: shell._id,
      })) as StoredCard | null;

      if (rawCard) {
        await writeCardDetailToWorker(worker, customId, rawCard);
      }
    }

    return shell;
  },
});

// Release a card from Convex cache (RAM) when no longer needed
export const releaseCard: ReturnType<typeof action> = action({
  args: { customId: v.string() },
  handler: async (ctx, { customId }): Promise<void> => {
    await ctx.runMutation(internal.cardCache.removeCachedCard, { customId });
  },
});

// Push all cards from Convex DB to KV (initial sync)
export const pushAllCardsToKV: ReturnType<typeof action> = action({
  args: {},
  handler: async (ctx): Promise<{ synced: number; skipped: number }> => {
    const worker = getWorkerConfig();
    if (!worker) {
      return { synced: 0, skipped: 0 };
    }

    const cards = (await ctx.runQuery(internal.cardCache.getAllCardsForSync)) as StoredCard[];
    let synced = 0;
    let skipped = 0;

    for (const card of cards) {
      try {
        await writeCardDetailToWorker(worker, card.customId, card);
        synced++;
      } catch {
        skipped++;
      }
    }

    return { synced, skipped };
  },
});

export const getHydratedCard: ReturnType<typeof action> = action({
  args: { customId: v.string() },
  handler: async (
    ctx,
    { customId }
  ): Promise<HydratedCard | null> => {
    const shell = (await ctx.runQuery(api.cards.get, {
      customId,
    })) as HydratedCard | null;

    if (!shell) {
      return null;
    }

    const worker = getWorkerConfig();
    if (!worker) {
      return shell;
    }

    const workerCard = (await readCardDetailFromWorker(
      worker,
      customId
    )) as Partial<StoredCard> | null;

    if (workerCard) {
      return {
        ...shell,
        ...workerCard,
        _id: shell._id,
        imageUrl: shell.imageUrl,
      };
    }

    const rawCard = (await ctx.runQuery(internal.cards.getForR2Sync, {
      cardId: shell._id,
    })) as StoredCard | null;

    if (rawCard) {
      await writeCardDetailToWorker(worker, customId, rawCard);
    }

    return shell;
  },
});

export const syncCardToR2 = internalAction({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const worker = getWorkerConfig();
    if (!worker) {
      return null;
    }

    const card = await ctx.runQuery(internal.cards.getForR2Sync, { cardId });
    if (!card) {
      return null;
    }

    await writeCardDetailToWorker(worker, card.customId, card);
    return null;
  },
});

export const deleteCardFromR2 = internalAction({
  args: { customId: v.string() },
  handler: async (_ctx, { customId }) => {
    const worker = getWorkerConfig();
    if (!worker) {
      return null;
    }

    await deleteCardObjectsFromWorker(worker, customId);
    return null;
  },
});

export const deleteCardsFromR2 = internalAction({
  args: { customIds: v.array(v.string()) },
  handler: async (_ctx, { customIds }) => {
    const worker = getWorkerConfig();
    if (!worker || customIds.length === 0) {
      return null;
    }

    await Promise.all(
      customIds.map((customId) => deleteCardObjectsFromWorker(worker, customId))
    );
    return null;
  },
});