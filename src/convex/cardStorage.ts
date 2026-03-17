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

type CardIndexItem = {
  customId: string;
  cardType: string;
  cardName: string;
  name_normalized: string;
  imageId?: StoredCard["imageId"];
  rarity?: string;
  frame?: string;
  batch?: string;
  numberingA?: number;
  numberingB?: number;
  signed?: string;
  isClaimed?: boolean;
  createdAt: number;
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

function getCardsIndexKey() {
  return "cards/index.json";
}

function getCardDetailUrl(config: WorkerConfig, customId: string) {
  const key = encodeURIComponent(getCardDetailKey(customId));
  return `${config.baseUrl}/cards/${encodeURIComponent(customId)}?key=${key}`;
}

function getCardsIndexUrl(config: WorkerConfig) {
  const key = encodeURIComponent(getCardsIndexKey());
  return `${config.baseUrl}/cards/__index__?key=${key}`;
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

async function readWorkerValue<T>(url: string, config: WorkerConfig) {
  const response = await fetch(url, {
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
  return (payload?.value ?? payload?.data ?? payload ?? null) as T | null;
}

async function writeWorkerValue(
  url: string,
  config: WorkerConfig,
  payload: unknown
) {
  const response = await fetch(url, {
    method: "PUT",
    headers: getWorkerHeaders(config, { json: true }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Worker write failed with status ${response.status}`);
  }
}

async function readCardDetailFromWorker(
  config: WorkerConfig,
  customId: string
) {
  return await readWorkerValue<StoredCard>(
    getCardDetailUrl(config, customId),
    config
  );
}

async function readCardsIndexFromWorker(config: WorkerConfig) {
  return await readWorkerValue<Array<CardIndexItem>>(
    getCardsIndexUrl(config),
    config
  );
}

async function writeCardDetailToWorker(
  config: WorkerConfig,
  customId: string,
  payload: unknown
) {
  await writeWorkerValue(getCardDetailUrl(config, customId), config, {
    key: getCardDetailKey(customId),
    value: payload,
  });
}

async function writeCardsIndexToWorker(
  config: WorkerConfig,
  payload: Array<CardIndexItem>
) {
  await writeWorkerValue(getCardsIndexUrl(config), config, {
    key: getCardsIndexKey(),
    value: payload,
  });
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

function normalizePageSize(pageSize?: number) {
  return Math.max(1, Math.min(pageSize ?? 50, 50));
}

function buildCardSummary(card: StoredCard): CardIndexItem {
  return {
    customId: card.customId,
    cardType: card.cardType,
    cardName: card.cardName,
    name_normalized: card.name_normalized,
    imageId: card.imageId,
    rarity: card.rarity,
    frame: card.frame,
    batch: card.batch,
    numberingA: card.numberingA,
    numberingB: card.numberingB,
    signed: card.signed,
    isClaimed: card.isClaimed,
    createdAt: card._creationTime,
  };
}

function toCacheCardData(card: Partial<StoredCard> & { _id?: StoredCard["_id"] }) {
  if (!card.customId || !card.cardType || !card.cardName || !card.name_normalized) {
    throw new Error("Card payload is missing required fields.");
  }

  return {
    sourceCardId: card._id,
    customId: card.customId,
    cardType: card.cardType,
    cardName: card.cardName,
    name_normalized: card.name_normalized,
    imageId: card.imageId,
    rarity: card.rarity,
    rarityId: card.rarityId,
    upgradeId: card.upgradeId,
    frame: card.frame,
    batch: card.batch,
    numberingA: card.numberingA,
    numberingB: card.numberingB,
    signed: card.signed,
    health: card.health,
    attackSlots: card.attackSlots,
    abilitySlots: card.abilitySlots,
    passiveSlots: card.passiveSlots,
    claimCode: card.claimCode,
    isClaimed: card.isClaimed,
    verifyToken: card.verifyToken,
    verifyTokenExpiry: card.verifyTokenExpiry,
  };
}

async function upsertCardIndexItem(
  config: WorkerConfig,
  card: StoredCard
) {
  const currentIndex = (await readCardsIndexFromWorker(config)) ?? [];
  const nextIndex = [
    buildCardSummary(card),
    ...currentIndex.filter((item) => item.customId !== card.customId),
  ];
  await writeCardsIndexToWorker(config, nextIndex);
}

async function ensureCardCached(
  ctx: any,
  customId: string,
  worker: WorkerConfig | null
) {
  let rawCard = worker
    ? await readCardDetailFromWorker(worker, customId)
    : null;

  if (!rawCard) {
    rawCard = (await ctx.runQuery(internal.cards.getByCustomIdForStorage, {
      customId,
    })) as StoredCard | null;

    if (rawCard && worker) {
      await writeCardDetailToWorker(worker, customId, rawCard);
      await upsertCardIndexItem(worker, rawCard);
    }
  }

  if (!rawCard) {
    return false;
  }

  await ctx.runMutation(internal.cardCache.cacheCard, {
    cardData: toCacheCardData(rawCard),
  });

  return true;
}

export const loadCard: ReturnType<typeof action> = action({
  args: { customId: v.string() },
  handler: async (ctx, { customId }): Promise<HydratedCard | null> => {
    const cached = (await ctx.runQuery(internal.cardCache.getCachedCard, {
      customId,
    })) as HydratedCard | null;

    if (cached) {
      await ctx.runMutation(internal.cardCache.cacheCard, {
        cardData: toCacheCardData(cached),
      });

      return (await ctx.runQuery(internal.cardCache.getCachedCard, {
        customId,
      })) as HydratedCard | null;
    }

    const worker = getWorkerConfig();
    const found = await ensureCardCached(ctx, customId, worker);
    if (!found) {
      return null;
    }

    return (await ctx.runQuery(internal.cardCache.getCachedCard, {
      customId,
    })) as HydratedCard | null;
  },
});

export const loadCardsByCustomIds: ReturnType<typeof action> = action({
  args: { customIds: v.array(v.string()) },
  handler: async (ctx, { customIds }) => {
    if (customIds.length === 0) {
      return [];
    }

    const uniqueCustomIds = Array.from(new Set(customIds));
    const worker = getWorkerConfig();
    const cached = (await ctx.runQuery(
      internal.cardCache.getCachedCardsByCustomIds,
      {
        customIds: uniqueCustomIds,
      }
    )) as Array<HydratedCard>;
    const cachedMap = new Map(cached.map((card) => [card.customId, card]));

    await Promise.all(
      uniqueCustomIds.map(async (customId) => {
        const existing = cachedMap.get(customId);
        if (existing) {
          await ctx.runMutation(internal.cardCache.cacheCard, {
            cardData: toCacheCardData(existing),
          });
          return;
        }

        await ensureCardCached(ctx, customId, worker);
      })
    );

    return (await ctx.runQuery(internal.cardCache.getCachedCardsByCustomIds, {
      customIds: uniqueCustomIds,
    })) as Array<HydratedCard>;
  },
});

export const releaseCard: ReturnType<typeof action> = action({
  args: { customId: v.string() },
  handler: async (ctx, { customId }): Promise<void> => {
    await ctx.runMutation(internal.cardCache.removeCachedCard, { customId });
  },
});

export const releaseCards: ReturnType<typeof action> = action({
  args: { customIds: v.array(v.string()) },
  handler: async (ctx, { customIds }): Promise<void> => {
    const uniqueCustomIds = Array.from(new Set(customIds));

    await Promise.all(
      uniqueCustomIds.map((customId) =>
        ctx.runMutation(internal.cardCache.removeCachedCard, { customId })
      )
    );
  },
});

export const loadCardsPage: ReturnType<typeof action> = action({
  args: {
    page: v.number(),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, { page, pageSize }) => {
    const safePage = Math.max(0, page);
    const safePageSize = normalizePageSize(pageSize);
    const worker = getWorkerConfig();

    if (worker) {
      const index = await readCardsIndexFromWorker(worker);
      if (index) {
        const start = safePage * safePageSize;
        const pageItems = index.slice(start, start + safePageSize);
        const customIds = pageItems.map((item) => item.customId);

        await ctx.runAction(api.cardStorage.loadCardsByCustomIds, {
          customIds,
        });

        const cards = (await ctx.runQuery(
          internal.cardCache.getCachedCardsByCustomIds,
          {
            customIds,
          }
        )) as Array<HydratedCard>;
        const ownerNames = (await ctx.runQuery(api.allCards.getOwnerNamesForCards, {
          customIds,
        })) as Record<string, string>;

        return {
          page: safePage,
          hasMore: start + safePageSize < index.length,
          cards: cards.map((card) => ({
            ...card,
            ownerName: ownerNames[card.customId] ?? "Unassigned",
          })),
        };
      }
    }

    const fallback = (await ctx.runQuery(api.allCards.getFallbackPage, {
      page: safePage,
      pageSize: safePageSize,
    })) as {
      cards: Array<StoredCard>;
      ownerByCustomId: Record<string, string>;
      hasMore: boolean;
    };

    await Promise.all(
      fallback.cards.map((card) =>
        ctx.runMutation(internal.cardCache.cacheCard, {
          cardData: toCacheCardData(card),
        })
      )
    );

    const cards = (await ctx.runQuery(internal.cardCache.getCachedCardsByCustomIds, {
      customIds: fallback.cards.map((card) => card.customId),
    })) as Array<HydratedCard>;

    return {
      page: safePage,
      hasMore: fallback.hasMore,
      cards: cards.map((card) => ({
        ...card,
        ownerName: fallback.ownerByCustomId[card.customId] ?? "Unassigned",
      })),
    };
  },
});

export const pushAllCardsToKV: ReturnType<typeof action> = action({
  args: {},
  handler: async (ctx): Promise<{ synced: number; skipped: number }> => {
    const worker = getWorkerConfig();
    if (!worker) {
      return { synced: 0, skipped: 0 };
    }

    const cards = (await ctx.runQuery(
      internal.cardCache.getAllCardsForSync
    )) as StoredCard[];
    let synced = 0;
    let skipped = 0;
    const indexItems: Array<CardIndexItem> = [];

    for (const card of cards) {
      try {
        await writeCardDetailToWorker(worker, card.customId, card);
        indexItems.push(buildCardSummary(card));
        synced++;
      } catch {
        skipped++;
      }
    }

    await writeCardsIndexToWorker(worker, indexItems);

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

    const workerCard = await readCardDetailFromWorker(worker, customId);

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
      await upsertCardIndexItem(worker, rawCard);
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
    await upsertCardIndexItem(worker, card);
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

    const currentIndex = (await readCardsIndexFromWorker(worker)) ?? [];
    await writeCardsIndexToWorker(
      worker,
      currentIndex.filter((item) => item.customId !== customId)
    );

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

    const uniqueCustomIds = Array.from(new Set(customIds));

    await Promise.all(
      uniqueCustomIds.map((customId) => deleteCardObjectsFromWorker(worker, customId))
    );

    const currentIndex = (await readCardsIndexFromWorker(worker)) ?? [];
    await writeCardsIndexToWorker(
      worker,
      currentIndex.filter((item) => !uniqueCustomIds.includes(item.customId))
    );

    return null;
  },
});