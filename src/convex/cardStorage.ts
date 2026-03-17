"use node";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const R2_BUCKET = process.env.R2_BUCKET;

function getR2Client() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey || !R2_BUCKET) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function getCardDetailKey(customId: string) {
  return `cards/${customId}/detail.json`;
}

function getCardImageKey(customId: string) {
  return `cards/${customId}/image`;
}

async function readCardDetailFromR2(client: S3Client, customId: string) {
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: getCardDetailKey(customId),
      })
    );

    const body = await response.Body?.transformToString();
    if (!body) {
      return null;
    }

    return JSON.parse(body);
  } catch (error: any) {
    if (
      error?.name === "NoSuchKey" ||
      error?.Code === "NoSuchKey" ||
      error?.$metadata?.httpStatusCode === 404
    ) {
      return null;
    }
    throw error;
  }
}

async function writeCardDetailToR2(
  client: S3Client,
  customId: string,
  payload: unknown
) {
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: getCardDetailKey(customId),
      Body: JSON.stringify(payload),
      ContentType: "application/json",
    })
  );
}

async function deleteCardObjectsFromR2(client: S3Client, customId: string) {
  await Promise.all([
    client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: getCardDetailKey(customId),
      })
    ),
    client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: getCardImageKey(customId),
      })
    ),
  ]);
}

export const getHydratedCard = action({
  args: { customId: v.string() },
  handler: async (ctx, { customId }) => {
    const shell = await ctx.runQuery(api.cards.get, { customId });
    if (!shell) {
      return null;
    }

    const client = getR2Client();
    if (!client) {
      return shell;
    }

    const r2Card = await readCardDetailFromR2(client, customId);
    if (r2Card) {
      return {
        ...shell,
        ...r2Card,
        _id: shell._id,
        imageUrl: shell.imageUrl,
      };
    }

    const rawCard = await ctx.runQuery(internal.cards.getForR2Sync, {
      cardId: shell._id,
    });

    if (rawCard) {
      await writeCardDetailToR2(client, customId, rawCard);
    }

    return shell;
  },
});

export const syncCardToR2 = internalAction({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const client = getR2Client();
    if (!client) {
      return null;
    }

    const card = await ctx.runQuery(internal.cards.getForR2Sync, { cardId });
    if (!card) {
      return null;
    }

    await writeCardDetailToR2(client, card.customId, card);
    return null;
  },
});

export const deleteCardFromR2 = internalAction({
  args: { customId: v.string() },
  handler: async (_ctx, { customId }) => {
    const client = getR2Client();
    if (!client) {
      return null;
    }

    await deleteCardObjectsFromR2(client, customId);
    return null;
  },
});

export const deleteCardsFromR2 = internalAction({
  args: { customIds: v.array(v.string()) },
  handler: async (_ctx, { customIds }) => {
    const client = getR2Client();
    if (!client || customIds.length === 0) {
      return null;
    }

    await Promise.all(customIds.map((customId) => deleteCardObjectsFromR2(client, customId)));
    return null;
  },
});
