import { query } from "./_generated/server";

export const getAllCardsWithOwners = query({
    args: {},
    handler: async (ctx) => {
        const cards = await ctx.db.query("cards").order("desc").collect();
        const userCards = await ctx.db.query("userCards").collect();
        const users = await ctx.db.query("users").collect();

        const ownerAccount = users.find(u => u.role === 'owner');

        const userCardMap = new Map(userCards.map(uc => [uc.cardId, uc.userId]));
        const userMap = new Map(users.map(u => [u._id, u.name]));

        const cardsWithOwners = await Promise.all(
            cards.map(async (card) => {
                const userId = userCardMap.get(card._id);
                let ownerName = "Unassigned";
                if (userId) {
                    ownerName = userMap.get(userId) || "Unknown User";
                } else if (ownerAccount) {
                    ownerName = ownerAccount.name;
                }

                const imageUrl = card.imageId ? await ctx.storage.getUrl(card.imageId) : null;

                return {
                    ...card,
                    ownerName: ownerName,
                    imageUrl: imageUrl,
                };
            })
        );

        return cardsWithOwners;
    }
});