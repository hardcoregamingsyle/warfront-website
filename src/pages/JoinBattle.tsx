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
import { Helmet } from "react-helmet-async";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function JoinBattle() {
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isCreatingMultiplayer, setIsCreatingMultiplayer] = useState(false);

  const battles = useQuery(api.battles.listAll);
  const multiBattles = useQuery(api.multiplayerBattles.list);

  const createBattle = useMutation(api.battles.create);
  const createMultiplayerBattle = useMutation(api.multiplayerBattles.create);
  const joinMultiplayerBattle = useMutation(api.multiplayerBattles.join);
  const leaveMultiplayerBattle = useMutation(api.multiplayerBattles.leave);

  const joinBattle = useMutation(api.battles.join);
  const cancelBattle = useMutation(api.battles.cancel);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const baseKeywords = "Warfront, Military, War, War Front, Game, Gaming, TCG, CCG, collectibles, card, card game, collectible card game, trading, trading card game, trading game, war game, military game, fun, family, family friendly, family friendly game, card games online, online games, fun games, Warfront, TCG, CCG, card game, online card game, offline card game, military theme, strategy game, family-friendly, collectible card game, physical cards, digital cards";
  const pageKeywords = "Warfront, 1v1, online battle, PvP, card game, join match, multiplayer, lobby";

  const battleStatus = useQuery(api.battles.isUserInActiveBattle);

  useEffect(() => {
    if (battleStatus?.inBattle) {
        if (battleStatus.battleType === '1v1') {
            navigate(`/battle/${battleStatus.battleId}`);
        } else if (battleStatus.battleType === 'multiplayer') {
            navigate(`/multi-battle/${battleStatus.battleId}`);
        }
    }
  }, [battleStatus, navigate]);

  const handleCreateBattle = async () => {
    if (!token) {
      toast.error("You must be logged in to create a battle.");
      return;
    }
    try {
      await createBattle({ token });
      toast.success("Battle created successfully!");
    } catch (error: any) {
      const errorMessage = error.data;
      if (errorMessage === "You are already in a Battle. You cannot Create or Join another Battle") {
        toast.error(errorMessage);
      } else {
        toast.error("An Unexpected Error Occurred. Please try again Later");
      }
    }
  };

  const handleCreateMultiplayerBattle = async () => {
    if (!token) {
      toast.error("You must be logged in to create a battle.");
      return;
    }
    setIsCreatingMultiplayer(true);
    try {
      const battleId = await createMultiplayerBattle({ maxPlayers, token });
      toast.success("Multiplayer battle created successfully! Redirecting...");
      navigate(`/multi-battle/${battleId}`);
    } catch (error: any) {
      toast.error(error.data || "Failed to create multiplayer battle.");
    } finally {
      setIsCreatingMultiplayer(false);
    }
  };

  const handleJoinMultiplayerBattle = async (battleId: Id<"multiplayerBattles">) => {
    if (!token) {
      toast.error("You must be logged in to join a battle.");
      return;
    }
    try {
      await joinMultiplayerBattle({ battleId, token });
      toast.success("Joined multiplayer battle successfully! Redirecting...");
      navigate(`/multi-battle/${battleId}`);
    } catch (error: any) {
      toast.error(error.data || "Failed to join multiplayer battle.");
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
      const errorMessage = error.data;
      if (errorMessage === "You are already in a Battle. You cannot Create or Join another Battle") {
        toast.error(errorMessage);
      } else {
        toast.error("An Unexpected Error Occurred. Please try again Later");
      }
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
      console.error("Failed to cancel battle:", error);
      toast.error(
        "An Unexpected Error Occurred. Please try again Later",
      );
    }
  };

  const handleCancelMultiplayerBattle = async (battleId: Id<"multiplayerBattles">) => {
    if (!token) {
      toast.error("Authentication error.");
      return;
    }
    try {
      await leaveMultiplayerBattle({ battleId, token });
      toast.success("Lobby deleted.");
    } catch (error: any) {
      console.error("Failed to delete lobby:", error);
      toast.error(error.data || "Failed to delete lobby.");
    }
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Warfront | Join a 1v1 Battle</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta name="description" content="Find and join a 1v1 match against players from around the world. Test your deck and strategy in the Warfront digital arena." />
        <meta name="keywords" content="Warfront, 1v1, online battle, PvP, card game, join match" />
        <meta property="og:title" content="Warfront 1v1 Match" />
        <meta property="og:description" content="Challenge players from around the world in a head-to-head battle." />
        <meta property="og:image" content="https://www.reddit.com/r/MemeTemplatesOfficial/comments/l25ks2/2_guys_fighting_1_guy_vibing/" />
      </Helmet>
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

          <div className="max-w-4xl mx-auto mb-4 flex justify-center gap-4">
            <Button
              onClick={handleCreateBattle}
              disabled={battleStatus?.inBattle}
            >
              Create 1v1 Battle
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create Multiplayer Battle
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>Create Multiplayer Lobby</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maxPlayers" className="text-right">
                      Max Players
                    </Label>
                    <Input
                      id="maxPlayers"
                      type="number"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      className="col-span-3 bg-slate-800 border-slate-600"
                      min={2}
                      max={8}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    onClick={handleCreateMultiplayerBattle}
                    disabled={isCreatingMultiplayer}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isCreatingMultiplayer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white my-8">1v1 Open Battles</h2>
            <div className="space-y-4">
              {battles === undefined && (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              {battles && battles.length === 0 && (
                <p className="text-center text-slate-400">
                  No open 1v1 battles. Be the first to create one!
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
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 sm:grid-cols-5 items-center gap-4">
                        {/* Host */}
                        <div className="col-span-1 sm:col-span-2 flex items-center gap-2 min-w-0">
                          <Avatar>
                            <AvatarImage src={battle.host?.image} alt={battle.host?.name} />
                            <AvatarFallback>{battle.host?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-slate-200 truncate">{battle.host?.name}</span>
                        </div>

                        {/* VS */}
                        <div className="col-span-1 flex justify-center">
                          <span className="text-slate-500 text-2xl font-thin">VS</span>
                        </div>

                        {/* Opponent */}
                        <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-2 min-w-0 text-right">
                          {battle.opponent ? (
                            <>
                              <span className="font-semibold text-slate-200 truncate">{battle.opponent?.name}</span>
                              <Avatar>
                                <AvatarImage src={battle.opponent?.image} alt={battle.opponent?.name} />
                                <AvatarFallback>{battle.opponent?.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </>
                          ) : (
                            <span className="text-green-400 font-bold">Waiting...</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
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
          </div>

          <div className="max-w-4xl mx-auto mt-12">
            <h2 className="text-3xl font-bold text-center text-white my-8">Multiplayer Lobbies</h2>
            <div className="space-y-4">
              {multiBattles === undefined && (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              {multiBattles && multiBattles.length === 0 && (
                <p className="text-center text-slate-400">
                  No open multiplayer lobbies. Be the first to create one!
                </p>
              )}
              {multiBattles?.map((battle, index) => (
                <motion.div
                  key={battle._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold text-white">Lobby by {battle.players[0]?.name}</p>
                          <p className="text-sm text-slate-400">
                            Players: {battle.playerIds.length} / {battle.maxPlayers}
                          </p>
                        </div>
                        {user && !battle.playerIds.includes(user._id) && (
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleJoinMultiplayerBattle(battle._id)}
                          >
                            Join Lobby
                          </Button>
                        )}
                        {user && user._id === battle.hostId && (
                          <Button
                            variant="destructive"
                            onClick={() => handleCancelMultiplayerBattle(battle._id)}
                            className="ml-2"
                          >
                            Delete Lobby
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        {battle.players.map(p => (
                          <Avatar key={p._id} className="h-8 w-8">
                            <AvatarImage src={p.image || undefined} />
                            <AvatarFallback>{p.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}