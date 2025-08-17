import DashboardLayout from "@/layouts/DashboardLayout";
import { useParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MultiBattle() {
    const { battleId } = useParams<{ battleId: Id<"multiplayerBattles"> }>();
    const battle = useQuery(api.multiplayerBattles.get, battleId ? { battleId } : "skip");

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
                <h1 className="text-4xl font-bold text-center mb-8">Multiplayer Battle Room</h1>
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