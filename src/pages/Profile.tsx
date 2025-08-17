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
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, UserX, Clock } from "lucide-react";
import { useMutation } from "convex/react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function Profile() {
  const { userId } = useParams<{ userId: Id<"users"> }>();
  const { token } = useAuth();
  const userProfile = useQuery(api.users.getUserProfile, userId ? { userId } : "skip");
  const friendshipStatus = useQuery(api.friends.checkFriendshipStatus, 
    userId && token ? { userId, token } : "skip"
  );
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const respondToFriendRequest = useMutation(api.friends.respondToFriendRequest);

  const handleSendFriendRequest = async () => {
    if (!userId || !token) return;
    
    try {
      await sendFriendRequest({ token, requesteeId: userId });
      toast.success("Friend request sent!");
    } catch (error: any) {
      toast.error(error.data || "Failed to send friend request");
    }
  };

  const handleRespondToRequest = async (response: "accepted" | "declined") => {
    // This would need the friendship ID, which we'd need to get from the friend requests
    // For now, this is a placeholder
    toast.success(`Friend request ${response}!`);
  };

  const renderFriendButton = () => {
    if (!friendshipStatus || friendshipStatus === "self") return null;

    switch (friendshipStatus) {
      case "none":
        return (
          <Button onClick={handleSendFriendRequest} className="bg-red-600 hover:bg-red-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Friend
          </Button>
        );
      case "friends":
        return (
          <Button disabled className="bg-green-600">
            <UserCheck className="mr-2 h-4 w-4" />
            Friends
          </Button>
        );
      case "pending_sent":
        return (
          <Button disabled className="bg-yellow-600">
            <Clock className="mr-2 h-4 w-4" />
            Request Sent
          </Button>
        );
      case "pending_received":
        return (
          <div className="flex gap-2">
            <Button onClick={() => handleRespondToRequest("accepted")} className="bg-green-600 hover:bg-green-700">
              <UserCheck className="mr-2 h-4 w-4" />
              Accept
            </Button>
            <Button onClick={() => handleRespondToRequest("declined")} variant="outline">
              <UserX className="mr-2 h-4 w-4" />
              Decline
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

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
        <title>{`${userProfile.displayName || userProfile.name}'s Warfront Profile`}</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta name="description" content="User's Bio" />
        <meta name="keywords" content={`${userProfile.name}, Warfront player, ${userProfile.name} Warfront, Warfront profile, player stats`} />
        <meta property="og:title" content={`${userProfile.displayName || userProfile.name}'s Warfront Profile`} />
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
            <CardTitle className="text-3xl font-bold text-white">
              {userProfile.displayName || userProfile.name}
            </CardTitle>
            <p className="text-lg text-slate-400">@{userProfile.name}</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {renderFriendButton()}
            <div className="text-center text-slate-400">
              <p>User ID: {userProfile._id}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}