import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";

export default function Competitive() {
  const baseKeywords = "Warfront, Military, War, War Front, Game, Gaming, TCG, CCG, collectibles, card, card game, collectible card game, trading, trading card game, trading game, war game, military game, fun, family, family friendly, family friendly game, card games online, online games, fun games, Warfront, TCG, CCG, card game, online card game, offline card game, military theme, strategy game, family-friendly, collectible card game, physical cards, digital cards";
  const pageKeywords = "Warfront tournaments, competitive card game, TCG leagues, Warfront rankings, online tournaments, esports, competitive play";

  return (
    <DashboardLayout>
      <Helmet>
        <title>Warfront Competitive Tournaments & Leagues</title>
        <meta name="description" content="Join official Warfront tournaments, compete in ranked leagues, and climb the global leaderboards. Host your own custom tournaments and prove your skills in Combat for the Digital Age." />
        <meta name="keywords" content="Warfront, Military, War, War Front, Game, Gaming, TCG, CCG, collectibles, card, card game, collectible card game, trading, trading card game, trading game, war game, military game, fun, family, family friendly, family friendly game, card games online, online games, fun games, Warfront, TCG, CCG, card game, online card game, offline card game, military theme, strategy game, family-friendly, collectible card game, physical cards, digital cards, Warfront tournaments, competitive card game, TCG leagues, Warfront rankings, online tournaments, esports, competitive play" />
        <meta property="og:title" content="Warfront Competitive Tournaments" />
        <meta property="og:description" content="Compete in official Warfront tournaments and climb the global leaderboards." />
        <meta property="og:image" content="https://www.printyourbrackets.com/single-elimination-tournament-brackets.html" />
      </Helmet>
      <div className="flex items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-red-400">Competitive Page</h1>
      </div>
    </DashboardLayout>
  );
}