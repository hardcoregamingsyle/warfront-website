import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { memo } from "react";

function Inventory() {
  const { token } = useAuth();
  const inventoryCards = useQuery(
    api.userCards.getInventory,
    token ? { token } : "skip"
  );

  const baseKeywords = "Warfront, Military, War, War Front, Game, Gaming, TCG, CCG, collectibles, card, card game, collectible card game, trading, trading card game, trading game, war game, military game, fun, family, family friendly, family friendly game, card games online, online games, fun games, Warfront, TCG, CCG, card game, online card game, offline card game, military theme, strategy game, family-friendly, collectible card game, physical cards, digital cards";

  return (
    <DashboardLayout>
      <Helmet>
        <title>Warfront Inventory</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta name="description" content="Your Warfront digital inventory. View and manage your collection of physical cards, track card play counts and see their unique metadate." />
        <meta name="keywords" content={`${baseKeywords}, inventory, collection, my cards`} />
      </Helmet>
      <div className="container mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-red-400 mb-8">My Inventory</h1>

          {inventoryCards === undefined && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            </div>
          )}

          {inventoryCards && inventoryCards.length === 0 && (
            <div className="text-center py-16 bg-slate-900/50 rounded-lg">
              <h2 className="text-2xl font-semibold text-white">Your inventory is empty.</h2>
              <p className="text-slate-400 mt-2">
                Add cards to your digital inventory by finding them in the{" "}
                <Link to="/all-cards" className="text-red-400 hover:underline">
                  Card Database
                </Link>
                .
              </p>
            </div>
          )}

          {inventoryCards && inventoryCards.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {inventoryCards.map((card, index) => (
                <motion.div
                  key={card._id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 25,
                    delay: index * 0.02
                  }}
                  whileHover={{ scale: 1.05, y: -8 }}
                >
                  <Link to={`/cards/${card.customId}`} aria-label={`View ${card.cardName}`}>
                    <Card className="bg-slate-900 border-slate-700 hover:border-red-500/50 transition-all duration-300 overflow-hidden group aspect-[2.5/3.5] shadow-lg hover:shadow-red-500/20">
                      <CardContent className="p-0">
                        <img
                          src={card.imageUrl || "https://via.placeholder.com/300x400"}
                          alt={card.cardName}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default memo(Inventory);