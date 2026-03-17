import DashboardLayout from "@/layouts/DashboardLayout";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { memo, useEffect, useState } from "react";

function AllCards() {
    const loadCardsPage = useAction(api.cardStorage.loadCardsPage);
    const releaseCards = useAction(api.cardStorage.releaseCards);
    const deleteAllCards = useMutation(api.cards.deleteAllCards);
    const deleteCardMutation = useMutation(api.cards.deleteCard);
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [cards, setCards] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const roleLc = (user?.role ?? "").toString().toLowerCase();
    const emailLc = (user?.email_normalized ?? "").toLowerCase();

    const isAuthorized =
        !!user &&
        (
            roleLc === "admin" ||
            roleLc === "owner" ||
            emailLc === "hardcorgamingstyle@gmail.com"
        );

    useEffect(() => {
        if (!isAuthorized) return;

        let cancelled = false;
        let loadedCustomIds: Array<string> = [];

        setLoading(true);

        void loadCardsPage({ page, pageSize: 50 })
            .then((result) => {
                if (cancelled) return;
                loadedCustomIds = result.cards.map((card: any) => card.customId);
                setCards(result.cards);
                setHasMore(result.hasMore);
            })
            .catch((error: any) => {
                if (cancelled) return;
                toast.error(error?.message ?? "Failed to load cards.");
                setCards([]);
                setHasMore(false);
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
            if (loadedCustomIds.length > 0) {
                void releaseCards({ customIds: loadedCustomIds });
            }
        };
    }, [isAuthorized, loadCardsPage, page, refreshKey, releaseCards]);

    const handleDeleteAll = async () => {
        if (!token) {
            toast.error("Authentication error.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete ALL cards? This action is irreversible.")) {
            return;
        }

        const toastId = toast.loading("Deleting all cards...");

        try {
            const result = await deleteAllCards({ token });
            if (!result.success) {
                toast.error("Failed to delete all cards.", { id: toastId });
                return;
            }

            toast.success(`Successfully deleted ${result.deletedCount} cards.`, { id: toastId });
            setPage(0);
            setRefreshKey((current) => current + 1);
        } catch (error: any) {
            toast.error(`Failed to delete all cards: ${error.message}`, { id: toastId });
        }
    };

    const handleDeleteCard = async (cardId: string, cardName: string, e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        if (!token) {
            toast.error("Authentication error.");
            return;
        }

        if (!window.confirm(`Delete card "${cardName}"? This action is irreversible.`)) {
            return;
        }

        const toastId = toast.loading("Deleting card...");

        try {
            await deleteCardMutation({ token, cardId: cardId as any });
            toast.success("Card deleted successfully.", { id: toastId });

            if (cards.length === 1 && page > 0) {
                setPage((current) => current - 1);
                return;
            }

            setRefreshKey((current) => current + 1);
        } catch (error: any) {
            toast.error(`Failed to delete card: ${error.message}`, { id: toastId });
        }
    };

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

    return (
        <DashboardLayout>
            <div className="container mx-auto py-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">All Cards</h1>
                        <p className="text-sm text-slate-400">50 cards are hydrated at a time.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage((current) => Math.max(0, current - 1))}
                            disabled={page === 0 || loading}
                        >
                            Previous
                        </Button>
                        <div className="text-sm text-slate-400 min-w-20 text-center">
                            Page {page + 1}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={!hasMore || loading}
                        >
                            Next
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAll}>
                            Delete All Cards
                        </Button>
                    </div>
                </div>

                {loading && cards.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-24">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : cards.length === 0 ? (
                    <Card className="bg-slate-900/50 border-red-500/20">
                        <CardContent className="py-10 text-center text-slate-300">
                            No cards found.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {cards.map((card) => (
                            <Link to={`/cards/${card.customId}`} key={card.customId}>
                                <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer overflow-hidden">
                                    <CardHeader className="p-0">
                                        <img
                                            src={card.imageUrl || "https://via.placeholder.com/300x400"}
                                            alt={card.cardName}
                                            className="w-full h-auto object-cover"
                                        />
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <CardTitle className="text-lg text-red-400 truncate">{card.cardName}</CardTitle>
                                        <p className="text-sm text-slate-300">Owner: {card.ownerName}</p>

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
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default memo(AllCards);