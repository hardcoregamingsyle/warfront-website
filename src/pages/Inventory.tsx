import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, QrCode, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <div className="container mx-auto py-2 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-red-400">My Inventory</h1>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link to="/scan?mode=single" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan 1 Card
                </Button>
              </Link>
              <Link to="/scan?mode=multi" className="flex-1 sm:flex-none">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  <Layers className="mr-2 h-4 w-4" />
                  Scan Multiple
                </Button>
              </Link>
            </div>
          </div>

          {inventoryCards === undefined && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-red-500" />
            </div>
          )}

          {inventoryCards && inventoryCards.length === 0 && (
            <div className="text-center py-12 sm:py-16 bg-slate-900/50 rounded-lg px-4 border border-slate-800">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Your inventory is empty.</h2>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">
                Add cards to your digital inventory by finding them in the{" "}
                <Link to="/all-cards" className="text-red-400 hover:underline">
                  Card Database
                </Link>
                {" "}or scanning your physical cards.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                 <Link to="/scan?mode=single">
                    <Button variant="secondary">Scan First Card</Button>
                 </Link>
              </div>
            </div>
          )}

          {inventoryCards && inventoryCards.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {inventoryCards.map((card, index) => (
                <motion.div
                  key={card._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to={`/cards/${card.customId}`} aria-label={`View ${card.cardName}`}>
                    <Card className="bg-slate-900 border-slate-800 hover:border-red-500/50 transition-all duration-200 overflow-hidden group aspect-[2.5/3.5] shadow-md hover:shadow-red-500/10">
                      <CardContent className="p-0 h-full relative">
                        <img
                          src={card.imageUrl || "https://via.placeholder.com/300x400"}
                          alt={card.cardName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                            <span className="text-xs text-white font-medium truncate w-full">{card.cardName}</span>
                        </div>
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