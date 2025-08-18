import { useState } from "react";
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
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export default function CardViewer() {
  const { cardId } = useParams<{ cardId: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

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
      <div className="container mx-auto py-8 flex justify-center items-center">
        <motion.div layout onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
          <Card className="max-w-md bg-black text-white border-slate-700">
              <CardHeader>
                  <CardTitle className="text-2xl text-red-500">{card.cardName}</CardTitle>
                  <p className="text-sm text-slate-400">{card.cardType}</p>
              </CardHeader>
              <CardContent>
                  <motion.img 
                      src={card.imageUrl || "https://via.placeholder.com/300x400"} 
                      alt={card.cardName} 
                      className="rounded-lg w-full"
                      layoutId={`card-image-${card._id}`}
                  />
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <Card className="bg-slate-900 p-3">
                            <p className="font-semibold text-slate-500">Rarity</p>
                            <p>{card.rarity}</p>
                        </Card>
                        <Card className="bg-slate-900 p-3">
                            <p className="font-semibold text-slate-500">Frame</p>
                            <p>{card.frame}</p>
                        </Card>
                        <Card className="bg-slate-900 p-3">
                            <p className="font-semibold text-slate-500">Batch</p>
                            <p>{card.batch}</p>
                        </Card>
                        <Card className="bg-slate-900 p-3">
                            <p className="font-semibold text-slate-500">Numbering</p>
                            <p>{card.numberingA}/{card.numberingB}</p>
                        </Card>
                        <Card className="bg-slate-900 p-3 col-span-2">
                            <p className="font-semibold text-slate-500">Signed</p>
                            <p>{card.signed}</p>
                        </Card>
                      </div>
                      <Link to="/blog/mig-29" className="text-red-400 hover:underline mt-4 inline-flex items-center gap-2">
                        Read Mission Brief <ExternalLink className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                  {user && (
                      <Button onClick={handleAddToInventory} className="w-full bg-red-600 hover:bg-red-700">
                          Add to Digital Inventory
                      </Button>
                  )}
                  {isAuthorizedEditor && (
                      <Link to={`/editor/card/${card._id}`} className="w-full">
                          <Button variant="outline" className="w-full border-red-500 text-red-400 hover:bg-red-500/10">Edit Card</Button>
                      </Link>
                  )}
              </CardFooter>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}