import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";

export default function HowToPlay() {
  const baseKeywords = "Warfront, Military, War, War Front, Game, Gaming, TCG, CCG, collectibles, card, card game, collectible card game, trading, trading card game, trading game, war game, military game, fun, family, family friendly, family friendly game, card games online, online games, fun games, Warfront, TCG, CCG, card game, online card game, offline card game, military theme, strategy game, family-friendly, collectible card game, physical cards, digital cards";
  const pageKeywords = "Warfront rules, how to play, card game rules, online gameplay, offline gameplay, Warfront guide, deck building, strategy tips";

  return (
    <DashboardLayout>
      <Helmet>
        <title>How to Play - Official Rules & Strategy Guide</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta name="description" content="Learn the official rules of Warfront and master the battlefield. Our guide covers both online and offline gameplay, deck building, and strategic tips for new and veteran players." />
        <meta name="keywords" content="Warfront rules, how to play, card game rules, online gameplay, offline gameplay, Warfront guide, deck building, strategy tips" />
        <meta property="og:title" content="How to Play Warfront" />
        <meta property="og:description" content="Learn the official rules and strategies for the Warfront TCG and CCG." />
        <meta property="og:image" content="https://www.youtube.com/watch?v=Jfr6HnXXw_c" />
      </Helmet>
      <div className="flex items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-red-400">How To Play</h1>
      </div>
    </DashboardLayout>
  );
}