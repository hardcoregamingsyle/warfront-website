import DashboardLayout from "@/layouts/DashboardLayout";
import { useParams } from "react-router";
import { Helmet } from "react-helmet-async";

export default function BattleRoom() {
  const { battleId } = useParams();
  const baseKeywords = "Warfront, Military, War, War Front, Game, Gaming, TCG, CCG, collectibles, card, card game, collectible card game, trading, trading card game, trading game, war game, military game, fun, family, family friendly, family friendly game, card games online, online games, fun games, Warfront, TCG, CCG, card game, online card game, offline card game, military theme, strategy game, family-friendly, collectible card game, physical cards, digital cards";

  return (
    <DashboardLayout>
      <Helmet>
        <title>Warfront Battle in Progress</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta name="description" content="You are currently in a live Warfront battle. The match is in progress" />
      </Helmet>
      <div className="container mx-auto text-center py-12">
        <h1 className="text-5xl font-bold text-red-500">Battle Room</h1>
        <p className="text-xl text-slate-300 mt-4">Battle ID: {battleId}</p>
        <div className="mt-12 p-8 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-3xl text-green-400 animate-pulse">The battle will begin shortly...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}