import { useParams, Link, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Loader2, FilePlus2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function CardViewer() {
  const { cardId } = useParams<{ cardId: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const card = useQuery(api.cards.get, cardId ? { cardId } : "skip");
  const addUserCard = useMutation(api.userCards.add);

  const handleAddToInventory = async () => {
    if (!token || !cardId || !card) {
      toast.error("You must be logged in to add cards.");
      return;
    }
    const toastId = toast.loading("Adding to inventory...");
    try {
      const result = await addUserCard({ token, cardId: card._id });
      if (result.success) {
        toast.success(result.message, { id: toastId });
      } else {
        toast.info(result.message, { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to add card to inventory.", { id: toastId });
    }
  };

  const handleCreateCard = () => {
    navigate("/dashboard");
    // On the dashboard, the user can click the create card button.
    // This is a placeholder to guide them. A toast could be better.
    toast.info("Click the 'Create Card' button on your dashboard to make a new one.");
  }

  if (card === undefined) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (card === null) {
    const isAuthorizedCreator = user && ["admin", "owner", "cardsetter"].includes(user.role!);
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl font-bold mb-4">Card Not Found</h1>
            <p className="text-slate-400 mb-6">Sorry, the card you are looking for does not exist.</p>
            {isAuthorizedCreator && (
                <Card className="max-w-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FilePlus2 />
                            Create a New Card?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Since this card doesn't exist, you can create a new one from your dashboard.
                        </p>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={() => navigate('/dashboard')} className="w-full">
                            Go to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
      </DashboardLayout>
    );
  }

  const isAuthorizedEditor = user && ["admin", "owner", "cardsetter"].includes(user.role!);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 flex justify-center">
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl">{card.cardName}</CardTitle>
                <p className="text-sm text-slate-500">{card.cardType}</p>
            </CardHeader>
            <CardContent>
                <img 
                    src={card.imageUrl || "https://via.placeholder.com/300x400"} 
                    alt={card.cardName} 
                    className="rounded-lg w-full"
                />
                <div className="mt-4">
                    <h3 className="font-bold">Card Details</h3>
                    <p>Some placeholder text about the card's abilities, history, or stats would go here.</p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                {user && (
                    <Button onClick={handleAddToInventory} className="w-full">
                        Add to Digital Inventory
                    </Button>
                )}
                {isAuthorizedEditor && (
                    <Link to={`/editor/card/${card._id}`} className="w-full">
                        <Button variant="outline" className="w-full">Edit Card</Button>
                    </Link>
                )}
            </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}