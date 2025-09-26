import DashboardLayout from "@/layouts/DashboardLayout";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { memo } from "react";

function AllCards() {
    const cards = useQuery(api.allCards.getAllCardsWithOwners);
    const deleteAllCards = useMutation(api.cards.deleteAllCards);
    const deleteCardMutation = useMutation(api.cards.deleteCard);
    const { user, token } = useAuth();
    const navigate = useNavigate();

    // Normalize role/email for robust checks (case-insensitive)
    const roleLc = (user?.role ?? "").toString().toLowerCase();
    const emailLc = (user?.email_normalized ?? "").toLowerCase();

    const handleDeleteAll = async () => {
        if (!token) {
            toast.error("Authentication error.");
            return;
        }
        if (window.confirm("Are you sure you want to delete ALL cards? This action is irreversible.")) {
            const toastId = toast.loading("Deleting all cards...");
            try {
                const result = await deleteAllCards({ token });
                if (result.success) {
                    toast.success(`Successfully deleted ${result.deletedCount} cards.`, { id: toastId });
                } else {
                    toast.error("Failed to delete all cards.", { id: toastId });
                }
            } catch (error: any) {
                toast.error(`Failed to delete all cards: ${error.message}`, { id: toastId });
                console.error(error);
            }
        }
    };

    const handleDeleteCard = async (cardId: string, cardName: string, e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (!token) {
            toast.error("Authentication error.");
            return;
        }
        if (!window.confirm(`Delete card "${cardName}"? This action is irreversible.`)) return;
        const toastId = toast.loading("Deleting card...");
        try {
            await deleteCardMutation({ token, cardId: cardId as any });
            toast.success("Card deleted successfully.", { id: toastId });
        } catch (error: any) {
            toast.error(`Failed to delete card: ${error.message}`, { id: toastId });
            console.error(error);
        }
    };

    const isAuthorized =
        !!user &&
        (
            roleLc === "admin" ||
            roleLc === "owner" ||
            emailLc === "hardcorgamingstyle@gmail.com"
        );

    if (!isAuthorized) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full py-24">
                    <Card className="bg-slate-900/50 border-red-500/20">
                        <CardHeader>
                            <CardTitle className="text-red-400">Access Denied</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-300">You are not authorized to view this page.</p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">All Cards</h1>
                    {isAuthorized && (
                        <Button variant="destructive" onClick={handleDeleteAll}>
                            Delete All Cards
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {cards.map((card) => (
                        <Link to={`/cards/${card.customId}`} key={card._id}>
                            <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer overflow-hidden">
                                <CardHeader className="p-0">
                                    <img src={card.imageUrl || "https://via.placeholder.com/300x400"} alt={card.cardName} className="w-full h-auto object-cover" />
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="text-lg text-red-400 truncate">{card.cardName}</CardTitle>
                                    <p className="text-sm text-slate-300">Owner: {card.ownerName}</p>

                                    {isAuthorized && (
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <Button
                                              variant="outline"
                                              className="border-red-500 text-red-400 hover:bg-red-500/10"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                navigate(`/editor/card/${card.customId}`);
                                              }}
                                            >
                                              Edit Card
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              onClick={(e) => handleDeleteCard(card._id, card.cardName, e)}
                                            >
                                              Delete Card
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default memo(AllCards);