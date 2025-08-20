import DashboardLayout from "@/layouts/DashboardLayout";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function MultiBattle() {
    const { battleId } = useParams<{ battleId: Id<"multiplayerBattles"> }>();
    const battle = useQuery(api.multiplayerBattles.get, battleId ? { battleId } : "skip");
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const leaveBattle = useMutation(api.multiplayerBattles.leave);

    const handleLeaveBattle = async () => {
        if (!battleId || !token) {
            toast.error("Error leaving battle.");
            return;
        }
        try {
            await leaveBattle({ battleId, token });
            toast.success("You have left the battle.");
            navigate("/join-battle");
        } catch (error: any) {
            toast.error(error.data || "Failed to leave battle.");
        }
    };

    if (battle === undefined) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-12 w-12 animate-spin text-red-500" />
                </div>
            </DashboardLayout>
        );
    }

    if (battle === null) {
        return (
            <DashboardLayout>
                <div className="text-center text-white">
                    <h1 className="text-3xl font-bold">Battle Not Found</h1>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto text-white">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-4xl font-bold">Multiplayer Battle Room</h1>
                  {battle && user && battle.playerIds.includes(user._id) && (
                         <Button variant="destructive" onClick={handleLeaveBattle}>Leave Battle</Button>
                    )}
                </div>
                <p className="text-center text-xl mb-4">Status: <span className="font-semibold">{battle.status}</span></p>
                <p className="text-center text-lg mb-8">Players: {battle.players.length} / {battle.maxPlayers}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {battle.players.map(player => (
                        <div key={player._id} className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-lg">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={player.image || undefined} />
                                <AvatarFallback>{player.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold">{player.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}