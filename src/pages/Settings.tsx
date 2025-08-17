import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";

export default function Settings() {
  const baseKeywords = "Warfront, Military, War, War Front, Game, Gaming, TCG, CCG, collectibles, card, card game, collectible card game, trading, trading card game, trading game, war game, military game, fun, family, family friendly, family friendly game, card games online, online games, fun games, Warfront, TCG, CCG, card game, online card game, offline card game, military theme, strategy game, family-friendly, collectible card game, physical cards, digital cards";

  return (
    <DashboardLayout>
      <Helmet>
        <title>Warfront Account Settings</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta name="description" content="Manage your Warfront account settings, including profile information, privacy preferences, and notification options." />
      </Helmet>
      <div className="flex items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-red-400">Settings Page</h1>
      </div>
    </DashboardLayout>
  );
}