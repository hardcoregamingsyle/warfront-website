import DashboardLayout from "@/layouts/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Id } from "@/convex/_generated/dataModel";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function JoinBattle() {
  const battles = useQuery(api.battles.listAll);
  const createBattle = useMutation(api.battles.create);
  const joinBattle = useMutation(api.battles.join);
  const cancelBattle = useMutation(api.battles.cancel);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (battles && user) {
      const myHostedBattle = battles.find(
        (b) => b.hostId === user._id && b.status === "Full",
      );
      if (myHostedBattle) {
        navigate(`/battle/${myHostedBattle._id}`);
      }
    }
  }, [battles, user, navigate]);

  const handleCreateBattle = async () => {
    if (!token) {
      toast.error("You must be logged in to create a battle.");
      return;
    }
    try {
      await createBattle({ token });
      toast.success("Battle created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create battle.");
    }
  };

  const handleJoinBattle = async (battleId: Id<"battles">) => {
    if (!token) {
      toast.error("You must be logged in to join a battle.");
      return;
    }
    try {
      await joinBattle({ battleId, token });
      toast.success("Joined battle successfully! Redirecting...");
      navigate(`/battle/${battleId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to join battle.");
    }
  };

  const handleCancelBattle = async (battleId: Id<"battles">) => {
    if (!token) {
      toast.error("Authentication error.");
      return;
    }
    try {
      await cancelBattle({ battleId, token });
      toast.success("Your battle has been canceled.");
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel battle.");
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-slate-900 text-white -m-8 p-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold tracking-tight text-red-500">
              Find a Battle
            </h1>
            <p className="text-xl text-slate-300 mt-4 max-w-2xl mx-auto">
              Choose your opponent and enter the fray. Victory awaits the bold.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-4 flex justify-center">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreateBattle}
            >
              Create Battle
            </Button>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {battles === undefined && (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
            {battles && battles.length === 0 && (
              <p className="text-center text-slate-400">
                No open battles. Be the first to create one!
              </p>
            )}
            {battles?.map((battle, index) => (
              <motion.div
                key={battle._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-slate-800 border border-slate-700 hover:border-red-500/50 transition-colors">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Avatar>
                        <AvatarImage
                          src={battle.host?.image}
                          alt={battle.host?.name}
                        />
                        <AvatarFallback>
                          {battle.host?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-slate-200 truncate">
                        {battle.host?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 text-2xl font-thin">
                        VS
                      </span>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
                      {battle.opponent ? (
                        <>
                          <Avatar>
                            <AvatarImage
                              src={battle.opponent?.image}
                              alt={battle.opponent?.name}
                            />
                            <AvatarFallback>
                              {battle.opponent?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-slate-200 truncate">
                            {battle.opponent?.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-green-400 font-bold">
                          Waiting for Opponent...
                        </span>
                      )}
                    </div>

                    <div className="w-full sm:w-auto sm:text-right">
                      {battle.status === "Open" &&
                        user?._id !== battle.hostId && (
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                            onClick={() => handleJoinBattle(battle._id)}
                          >
                            Join Battle
                          </Button>
                        )}
                      {battle.status === "Full" && (
                        <Button variant="destructive" disabled className="w-full sm:w-auto">
                          Full
                        </Button>
                      )}
                      {battle.status === "Open" &&
                        user?._id === battle.hostId && (
                          <Button variant="destructive" onClick={() => handleCancelBattle(battle._id)} className="w-full sm:w-auto">
                            Cancel
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}