import DashboardLayout from "@/layouts/DashboardLayout";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MultiBattle() {
  const battles = useQuery(api.multiplayerBattles.list);
  const createBattle = useMutation(api.multiplayerBattles.create);
  const joinBattle = useMutation(api.multiplayerBattles.join);
  const leaveBattle = useMutation(api.multiplayerBattles.leave);
  const startBattle = useMutation(api.multiplayerBattles.start);
  const { user, token } = useAuth();
  const [maxPlayers, setMaxPlayers] = useState(3);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const userInBattle = battles?.some(battle => user && battle.playerIds.includes(user._id));

  const handleCreateBattle = async () => {
    if (!token) {
      toast.error("You must be logged in to create a battle.");
      return;
    }
    try {
      await createBattle({ token, maxPlayers });
      toast.success("Multiplayer battle created successfully!");
      setCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.data || "Failed to create battle.");
    }
  };

  const handleJoinBattle = async (battleId: Id<"multiplayerBattles">) => {
    if (!token) {
      toast.error("You must be logged in to join a battle.");
      return;
    }
    try {
      await joinBattle({ battleId, token });
      toast.success("Joined multiplayer battle successfully!");
    } catch (error: any) {
      const errorMessage = error.data;
      if (errorMessage === "You are already in a Battle. You cannot Create or Join another Battle") {
        toast.error(errorMessage);
      } else {
        toast.error("An Unexpected Error Occurred. Please try again Later");
      }
    }
  };

  const handleLeaveBattle = async (battleId: Id<"multiplayerBattles">) => {
    if (!token) {
      toast.error("You must be logged in to leave a battle.");
      return;
    }
    try {
      await leaveBattle({ battleId, token });
      toast.success("You have left the battle.");
    } catch (error: any) {
      toast.error(
        error.data || "An unexpected error occurred while leaving the battle.",
      );
    }
  };

  const handleStartBattle = async (battleId: Id<"multiplayerBattles">) => {
    if (!token) {
      toast.error("You must be logged in to start a battle.");
      return;
    }
    try {
      await startBattle({ battleId, token });
      toast.success("Battle started!");
    } catch (error: any) {
      toast.error(error.data || "Failed to start battle.");
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-slate-900 text-white -m-8 p-8 min-h-screen">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-blue-500">
              Multiplayer Battles
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mt-4 max-w-2xl mx-auto">
              Create or join a battle with up to 10 players.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-4 flex justify-center">
            <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={userInBattle}>
                  Create Multiplayer Battle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700">
                <DialogHeader>
                  <DialogTitle>Create Multiplayer Battle</DialogTitle>
                  <DialogDescription>
                    Select the maximum number of players for your battle (3-10).
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Slider
                    defaultValue={[maxPlayers]}
                    min={3}
                    max={10}
                    step={1}
                    onValueChange={(value) => setMaxPlayers(value[0])}
                  />
                  <div className="text-center font-bold text-lg">{maxPlayers} Players</div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateBattle} className="bg-blue-600 hover:bg-blue-700">Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {battles === undefined && (
              <div className="col-span-full flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
            {battles && battles.length === 0 && (
              <p className="col-span-full text-center text-slate-400">
                No open multiplayer battles. Be the first to create one!
              </p>
            )}
            {battles?.map((battle) => (
              <Card key={battle._id} className="bg-slate-800 border border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="truncate">Hosted by {battle.host?.name}</CardTitle>
                  <CardDescription>
                    {battle.playerIds.length} / {battle.maxPlayers} Players
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-slate-400">Players:</p>
                    <div className="flex flex-wrap gap-2">
                      {battle.players.map((player) => (
                        <div key={player?._id} className="flex items-center gap-2 bg-slate-700/50 px-2 py-1 rounded-full text-xs">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={player?.image} alt={player?.name ?? ""} />
                            <AvatarFallback>{player?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium truncate">{player?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    {user && battle.hostId === user._id && (
                        <>
                            {battle.playerIds.length >= 3 && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStartBattle(battle._id)}>
                                    Start Battle
                                </Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => handleLeaveBattle(battle._id)}>
                                Cancel
                            </Button>
                        </>
                    )}
                    {user && battle.playerIds.includes(user._id) && battle.hostId !== user._id && (
                         <Button size="sm" variant="destructive" onClick={() => handleLeaveBattle(battle._id)}>
                            Leave
                        </Button>
                    )}
                    {user && !battle.playerIds.includes(user._id) && battle.playerIds.length < battle.maxPlayers && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleJoinBattle(battle._id)} disabled={userInBattle}>
                        Join
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}