import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCheck, UserX, Users, UserMinus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { memo } from "react";

function Friends() {
  const { token } = useAuth();
  const friendRequests = useQuery(api.friends.getFriendRequests, token ? { token } : "skip");
  const friends = useQuery(api.friends.getFriends, token ? { token } : "skip");
  const respondToRequest = useMutation(api.friends.respondToFriendRequest);
  const unfriend = useMutation(api.friends.unfriendUser);

  const handleResponse = async (friendshipId: Id<"friendships">, response: "accepted" | "declined") => {
    if (!token) return;
    
    try {
      await respondToRequest({ token, friendshipId: friendshipId as Id<"friendships">, response });
      toast.success(`Friend request ${response}!`);
    } catch (error: any) {
      toast.error(error.data || "Failed to respond to friend request");
    }
  };

  const handleUnfriend = async (friendId: Id<"users">) => {
    if (!token) return;
    const t = toast.loading("Unfriending...");
    try {
      await unfriend({ token, friendId });
      toast.success("Unfriended", { id: t });
    } catch (error: any) {
      toast.error(error.data || "Failed to unfriend", { id: t });
    }
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Friends - Warfront</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center py-8">
          <h1 className="text-5xl font-bold tracking-tight text-red-500 mb-4">
            Friends
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Manage your friend requests and connections.
          </p>
        </div>

        {/* Friend Requests */}
        {friendRequests && friendRequests.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Friend Requests ({friendRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {friendRequests.map((request, index) => (
                <motion.div 
                  key={request._id} 
                  className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={request.requester?.image} alt={request.requester?.name || "User"} />
                      <AvatarFallback>{request.requester?.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">
                        {request.requester?.displayName || request.requester?.name}
                      </p>
                      <p className="text-sm text-slate-400">@{request.requester?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleResponse(request._id, "accepted")}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                      aria-label={`Accept friend request from ${request.requester?.name}`}
                    >
                      <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                      Accept
                    </Button>
                    <Button 
                      onClick={() => handleResponse(request._id, "declined")}
                      variant="outline"
                      size="sm"
                      aria-label={`Decline friend request from ${request.requester?.name}`}
                    >
                      <UserX className="mr-2 h-4 w-4" aria-hidden="true" />
                      Decline
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Friends ({friends?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {friends && friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend, index) => (
                  <motion.div 
                    key={friend._id} 
                    className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700/50 transition-colors"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={friend.image} alt={friend.name || "User"} />
                        <AvatarFallback>{friend.name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">
                          {friend.displayName || friend.name}
                        </p>
                        <p className="text-sm text-slate-400">@{friend.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUnfriend(friend._id as Id<"users">)}
                        aria-label={`Unfriend ${friend.name}`}
                      >
                        <UserMinus className="mr-2 h-4 w-4" aria-hidden="true" />
                        Unfriend
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-8">
                No friends yet. Start by searching for users and sending friend requests!
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}

export default memo(Friends);