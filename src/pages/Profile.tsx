import { useParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export default function Profile() {
  const { userId } = useParams<{ userId: Id<"users"> }>();
  const userProfile = useQuery(api.users.getUserProfile, userId ? { userId } : "skip");
  const baseKeywords = "Warfront, Military, War, War Front, Game, Gaming, TCG, CCG, collectibles, card, card game, collectible card game, trading, trading card game, trading game, war game, military game, fun, family, family friendly, family friendly game, card games online, online games, fun games, Warfront, TCG, CCG, card game, online card game, offline card game, military theme, strategy game, family-friendly, collectible card game, physical cards, digital cards";
  const pageKeywords = `${userProfile?.name}, Warfront player, ${userProfile?.name} Warfront, Warfront profile, player stats`;

  if (userProfile === undefined) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-red-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (userProfile === null) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">User not found</h1>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${userProfile.name}'s Warfront Profile`}</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta name="description" content="User's Bio" />
        <meta name="keywords" content={`${userProfile.name}, Warfront player, ${userProfile.name} Warfront, Warfront profile, player stats`} />
        <meta property="og:title" content={`${userProfile.name}'s Warfront Profile`} />
        <meta property="og:description" content="User's Bio" />
        <meta property="og:image" content={userProfile.image} />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-2xl mx-auto bg-slate-900/50 border-slate-700">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-red-500">
              <AvatarImage src={userProfile.image} alt={userProfile.name} />
              <AvatarFallback className="text-3xl">{userProfile.name?.[0]}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold text-white">{userProfile.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add more profile details here in the future */}
            <div className="text-center text-slate-400">
              <p>User ID: {userProfile._id}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}