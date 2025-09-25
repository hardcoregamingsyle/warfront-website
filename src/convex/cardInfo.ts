import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper: assert admin privileges by token (reused from users.ts pattern)
const assertIsAdmin = async (ctx: any, token: string) => {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();

  if (!session || session.expires < Date.now()) {
    throw new Error("Invalid or expired session");
  }
  const current = await ctx.db.get(session.userId);
  if (!current) throw new Error("User not found");

  const roleLc = (current.role ?? "").toString().toLowerCase();
  const emailLc = (current.email_normalized ?? "").toLowerCase();
  const isAdmin =
    roleLc === "admin" ||
    roleLc === "owner" ||
    emailLc === "hardcorgamingstyle@gmail.com";

  if (!isAdmin) {
    throw new Error("Not authorized");
  }
  return { current, session };
};

// Queries
export const listCardNames = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("cards")
      .order("asc")
      .collect()
      .then(cards => cards.map(card => ({
        _id: card._id,
        cardName: card.cardName,
        customId: card.customId,
        cardType: card.cardType,
      })));
  },
});

export const listUpgrades = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("upgrades").order("asc").collect();
  },
});

export const listRarities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rarities").order("asc").collect();
  },
});

export const listBatchesForCard = query({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    return await ctx.db
      .query("batches")
      .withIndex("by_cardId", (q) => q.eq("cardId", cardId))
      .order("asc")
      .collect();
  },
});

export const listAttacks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("attacks").order("asc").collect();
  },
});

export const listPassives = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("passives").order("asc").collect();
  },
});

export const listAbilities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("abilities").order("asc").collect();
  },
});

// Mutations
export const deleteCard = mutation({
  args: { token: v.string(), cardId: v.id("cards") },
  handler: async (ctx, { token, cardId }) => {
    await assertIsAdmin(ctx, token);
    
    const card = await ctx.db.get(cardId);
    if (!card) throw new Error("Card not found");

    // Delete associated batches
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_cardId", (q) => q.eq("cardId", cardId))
      .collect();
    
    for (const batch of batches) {
      await ctx.db.delete(batch._id);
    }

    // Delete associated userCards
    const userCards = await ctx.db
      .query("userCards")
      .withIndex("by_cardId", (q) => q.eq("cardId", cardId))
      .collect();
    
    for (const userCard of userCards) {
      await ctx.db.delete(userCard._id);
    }

    // Delete the card
    await ctx.db.delete(cardId);
    return "Card deleted successfully";
  },
});

export const deleteUpgrade = mutation({
  args: { token: v.string(), upgradeId: v.id("upgrades") },
  handler: async (ctx, { token, upgradeId }) => {
    await assertIsAdmin(ctx, token);
    
    const upgrade = await ctx.db.get(upgradeId);
    if (!upgrade) throw new Error("Upgrade not found");

    await ctx.db.delete(upgradeId);
    return "Upgrade deleted successfully";
  },
});

export const renameUpgrade = mutation({
  args: { token: v.string(), upgradeId: v.id("upgrades"), newName: v.string() },
  handler: async (ctx, { token, upgradeId, newName }) => {
    await assertIsAdmin(ctx, token);
    
    const upgrade = await ctx.db.get(upgradeId);
    if (!upgrade) throw new Error("Upgrade not found");

    await ctx.db.patch(upgradeId, {
      name: newName,
      name_normalized: newName.toLowerCase(),
    });
    return "Upgrade renamed successfully";
  },
});

export const addBatch = mutation({
  args: {
    token: v.string(),
    cardId: v.id("cards"),
    type: v.union(v.literal("NORMAL"), v.literal("EXCLUSIVE"), v.literal("LIMITED")),
    maxSupply: v.optional(v.number()),
  },
  handler: async (ctx, { token, cardId, type, maxSupply }) => {
    await assertIsAdmin(ctx, token);
    
    const card = await ctx.db.get(cardId);
    if (!card) throw new Error("Card not found");

    // Validate maxSupply based on type
    if (type === "NORMAL" && (!maxSupply || maxSupply <= 0)) {
      throw new Error("Normal batches require a positive max supply");
    }
    if ((type === "EXCLUSIVE" || type === "LIMITED") && maxSupply) {
      throw new Error("Exclusive and Limited batches should not have max supply");
    }

    // Find next available label (A, B, C, ...)
    const existingBatches = await ctx.db
      .query("batches")
      .withIndex("by_cardId", (q) => q.eq("cardId", cardId))
      .collect();
    
    const usedLabels = new Set(existingBatches.map(b => b.label));
    let nextLabel = "A";
    
    // Find first unused letter A-Z
    for (let i = 0; i < 26; i++) {
      const label = String.fromCharCode(65 + i); // A=65, B=66, etc.
      if (!usedLabels.has(label)) {
        nextLabel = label;
        break;
      }
    }
    
    // If all A-Z are used, start with A1, B1, etc.
    if (usedLabels.has(nextLabel)) {
      let suffix = 1;
      while (usedLabels.has(`A${suffix}`)) {
        suffix++;
      }
      nextLabel = `A${suffix}`;
    }

    // Check for duplicate (cardId, label) combination
    const existing = await ctx.db
      .query("batches")
      .withIndex("by_cardId_and_label", (q) => 
        q.eq("cardId", cardId).eq("label", nextLabel)
      )
      .unique();
    
    if (existing) {
      throw new Error("Batch label already exists for this card");
    }

    await ctx.db.insert("batches", {
      cardId,
      label: nextLabel,
      type,
      maxSupply: type === "NORMAL" ? maxSupply! : undefined,
      minted: 0,
      isComplete: false,
    });

    return `Batch ${nextLabel} created successfully`;
  },
});

export const markBatchComplete = mutation({
  args: { token: v.string(), batchId: v.id("batches") },
  handler: async (ctx, { token, batchId }) => {
    await assertIsAdmin(ctx, token);
    
    const batch = await ctx.db.get(batchId);
    if (!batch) throw new Error("Batch not found");

    await ctx.db.patch(batchId, { isComplete: true });
    return "Batch marked as complete";
  },
});

// Creation mutations for Rarity and Upgrade
export const createRarity = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { token, name, code, description }) => {
    await assertIsAdmin(ctx, token);

    const name_normalized = name.toLowerCase();
    const dup = await ctx.db
      .query("rarities")
      .withIndex("by_name_normalized", (q) => q.eq("name_normalized", name_normalized))
      .unique();
    if (dup) throw new Error("Rarity with this name already exists");

    const id = await ctx.db.insert("rarities", {
      name,
      name_normalized,
      code,
      description,
    });
    return id;
  },
});

export const createUpgrade = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { token, name, description }) => {
    await assertIsAdmin(ctx, token);

    const name_normalized = name.toLowerCase();
    const dup = await ctx.db
      .query("upgrades")
      .withIndex("by_name_normalized", (q) => q.eq("name_normalized", name_normalized))
      .unique();
    if (dup) throw new Error("Upgrade with this name already exists");

    const id = await ctx.db.insert("upgrades", {
      name,
      name_normalized,
      description,
    });
    return id;
  },
});

// Create Card mutation (syncs fields with cards usage)
export const createCard = mutation({
  args: {
    token: v.string(),
    customId: v.string(),
    cardType: v.string(),
    cardName: v.string(),
    health: v.number(),
    attackSlots: v.number(),
    abilitySlots: v.number(),
    passiveSlots: v.optional(v.number()),
    rarityId: v.optional(v.id("rarities")),
    upgradeId: v.optional(v.id("upgrades")),
  },
  handler: async (ctx, args) => {
    const { token, customId, cardType, cardName, health, attackSlots, abilitySlots, passiveSlots, rarityId, upgradeId } = args;
    await assertIsAdmin(ctx, token);

    const exists = await ctx.db
      .query("cards")
      .withIndex("by_customId", (q) => q.eq("customId", customId))
      .unique();
    if (exists) throw new Error("A card with this customId already exists");

    const name_normalized = cardName.toLowerCase();

    const id = await ctx.db.insert("cards", {
      customId,
      cardType,
      cardName,
      name_normalized,
      rarityId,
      upgradeId,
      health,
      attackSlots,
      abilitySlots,
      passiveSlots,
    });
    return id;
  },
});

// Create Attack / Passive / Ability
export const createAttack = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    description: v.string(),
    attackType: v.string(),
    subject: v.optional(v.string()),
    damage: v.optional(v.number()),
    heal: v.optional(v.number()),
    value: v.optional(v.number()),
  },
  handler: async (ctx, { token, name, description, attackType, subject, damage, heal, value }) => {
    await assertIsAdmin(ctx, token);

    const id = await ctx.db.insert("attacks", {
      name,
      name_normalized: name.toLowerCase(),
      subject,
      description,
      attackType,
      damage,
      heal,
      value,
    });
    return id;
  },
});

export const createPassive = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("DAMAGE_BOOST"),
      v.literal("HEALTH_BOOST"),
      v.literal("DEFENCE"),
      v.literal("AUTO_HEAL_SELF"),
      v.literal("AUTO_HEAL_ALLY"),
    ),
  },
  handler: async (ctx, { token, name, description, type }) => {
    await assertIsAdmin(ctx, token);

    const id = await ctx.db.insert("passives", {
      name,
      name_normalized: name.toLowerCase(),
      type,
      description,
    });
    return id;
  },
});

export const createAbility = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("DESTROY_TARGET"),
      v.literal("STUN"),
      v.literal("LONG_STUN"),
      v.literal("EXTRA_LONG_STUN"),
      v.literal("BOOST_ALL_ALLIES"),
      v.literal("HEAL_ALLIES"),
      v.literal("MULTIPLE_TARGETS"),
      v.literal("REVIVE"),
      v.literal("REUSE"),
      v.literal("MULTIPLE_TURNS"),
    ),
    value: v.optional(v.number()),
  },
  handler: async (ctx, { token, name, description, type, value }) => {
    await assertIsAdmin(ctx, token);

    const id = await ctx.db.insert("abilities", {
      name,
      name_normalized: name.toLowerCase(),
      type,
      description,
      value,
    });
    return id;
  },
});

// Seed data for testing
export const seedAdminCardInfo = mutation({
  args: {},
  handler: async (ctx) => {
    // Create rarities
    const commonId = await ctx.db.insert("rarities", {
      name: "Common",
      name_normalized: "common",
      code: "C",
      description: "Basic rarity cards",
    });
    
    const rareId = await ctx.db.insert("rarities", {
      name: "Rare",
      name_normalized: "rare", 
      code: "R",
      description: "Rare cards with enhanced abilities",
    });

    // Create upgrades
    const fireUpgradeId = await ctx.db.insert("upgrades", {
      name: "Fire Enhancement",
      name_normalized: "fire enhancement",
      description: "Adds fire damage to attacks",
    });
    
    const iceUpgradeId = await ctx.db.insert("upgrades", {
      name: "Ice Shield",
      name_normalized: "ice shield",
      description: "Provides ice-based defense",
    });

    // Create cards
    const card1Id = await ctx.db.insert("cards", {
      customId: "WARRIOR_001",
      cardType: "Character",
      cardName: "Fire Warrior",
      name_normalized: "fire warrior",
      rarityId: rareId,
      upgradeId: fireUpgradeId,
      health: 100,
      attackSlots: 2,
      abilitySlots: 1,
    });

    const card2Id = await ctx.db.insert("cards", {
      customId: "MAGE_001", 
      cardType: "Character",
      cardName: "Ice Mage",
      name_normalized: "ice mage",
      rarityId: commonId,
      upgradeId: iceUpgradeId,
      health: 80,
      attackSlots: 1,
      abilitySlots: 2,
    });

    const card3Id = await ctx.db.insert("cards", {
      customId: "SPELL_001",
      cardType: "Spell",
      cardName: "Lightning Bolt",
      name_normalized: "lightning bolt",
      rarityId: rareId,
      health: 0,
      attackSlots: 0,
      abilitySlots: 1,
    });

    // Create batches
    await ctx.db.insert("batches", {
      cardId: card1Id,
      label: "A",
      type: "NORMAL",
      maxSupply: 1000,
      minted: 250,
      isComplete: false,
    });

    await ctx.db.insert("batches", {
      cardId: card1Id,
      label: "B", 
      type: "EXCLUSIVE",
      minted: 5,
      isComplete: true,
    });

    await ctx.db.insert("batches", {
      cardId: card2Id,
      label: "A",
      type: "NORMAL",
      maxSupply: 500,
      minted: 500,
      isComplete: true,
    });

    return "Seed data created successfully";
  },
});