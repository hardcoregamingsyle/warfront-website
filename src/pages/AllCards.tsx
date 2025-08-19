import DashboardLayout from "@/layouts/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";

export default function AllCards() {
    const cards = useQuery(api.allCards.getAllCardsWithOwners);

    if (cards === undefined) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-6">All Cards</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {cards.map((card) => (
                        <Link to={`/cards/${card._id}`} key={card._id}>
                            <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer overflow-hidden">
                                <CardHeader className="p-0">
                                    <img src={card.imageUrl || "https://via.placeholder.com/300x400"} alt={card.cardName} className="w-full h-auto object-cover" />
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="text-lg text-red-400 truncate">{card.cardName}</CardTitle>
                                    <p className="text-sm text-slate-300">Owner: {card.ownerName}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
