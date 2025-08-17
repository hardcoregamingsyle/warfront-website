import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";

export default function TradeHistory() {
  const baseKeywords = "Warfront, Military, War, War Front, Game, Gaming, TCG, CCG, collectibles, card, card game, collectible card game, trading, trading card game, trading game, war game, military game, fun, family, family friendly, family friendly game, card games online, online games, fun games, Warfront, TCG, CCG, card game, online card game, offline card game, military theme, strategy game, family-friendly, collectible card game, physical cards, digital cards";

  return (
    <DashboardLayout>
      <Helmet>
        <title>Warfront Trade History</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta name="description" content="Review the full history of your card transfers. This ledger details every card that has moved in and out of your digital inventory." />
      </Helmet>
      <div className="flex items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-red-400">Trade History</h1>
      </div>
    </DashboardLayout>
  );
}