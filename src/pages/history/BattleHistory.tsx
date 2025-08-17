import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";

export default function BattleHistory() {
  const baseKeywords = "Warfront, Military, War, War Front, Game, Gaming, TCG, CCG, collectibles, card, card game, collectible card game, trading, trading card game, trading game, war game, military game, fun, family, family friendly, family friendly game, card games online, online games, fun games, Warfront, TCG, CCG, card game, online card game, offline card game, military theme, strategy game, family-friendly, collectible card game, physical cards, digital cards";

  return (
    <DashboardLayout>
      <Helmet>
        <title>Warfront Battle History</title>
        <meta name="description" content="Analize your past Warfront matches. Your battle log records every opponent, outcome, and match type to help you track your progress and perfect your strategy." />
      </Helmet>
      <div className="flex items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-red-400">Battle History</h1>
      </div>
    </DashboardLayout>
  );
}