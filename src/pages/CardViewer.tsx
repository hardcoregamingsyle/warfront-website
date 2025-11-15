import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Loader2, FilePlus2, Trash2, ExternalLink, QrCode } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

export default function CardViewer() {
  const { cardId: customId } = useParams<{ cardId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const verifyToken = searchParams.get("verify");
  const method = searchParams.get("method");

  const card = useQuery(api.cards.get, customId ? { customId } : "skip");
  const verifyResult = useQuery(
    api.cards.validateVerifyToken,
    verifyToken && customId ? { customId, verifyToken } : "skip"
  );
  
  const userCard = useQuery(
    api.userCards.getForCurrentUser,
    card && token ? { cardId: card._id, token } : "skip"
  );
  
  const addWithClaimCode = useMutation(api.userCards.addWithClaimCode);
  const deleteCardMutation = useMutation(api.cards.deleteCard);
  const createCardWithId = useMutation(api.cards.createCardWithId);
  const consumeToken = useMutation(api.cards.consumeVerifyToken);

  // Handle QR code verification flow
  useEffect(() => {
    if (verifyToken && verifyResult && customId) {
      if (verifyResult.valid) {
        // Valid QR scan - mark as verified and immediately redirect to method=valid
        // This hides the verification token from the URL
        setIsVerified(true);
        setSearchParams({ method: "valid" }, { replace: true });
        // Consume the token so it can't be reused
        if (verifyResult.cardId) {
          consumeToken({ cardId: verifyResult.cardId }).catch(() => {});
        }
      } else {
        // Invalid or expired token
        toast.error(verifyResult.reason || "Invalid QR code");
        navigate(`/cards/${customId}`, { replace: true });
      }
    } else if (method === "valid" && !isVerified) {
      // Someone tried to access method=valid directly without scanning
      toast.error("Please scan the QR code on your physical card");
      navigate(`/cards/${customId}`, { replace: true });
    }
  }, [verifyToken, verifyResult, method, isVerified, customId, setSearchParams, consumeToken, navigate]);

  const handleClaimCard = async () => {
    if (!token || !customId || !card) {
      toast.error("You must be logged in to claim cards.");
      return;
    }
    
    if (!isVerified) {
      toast.error("Please scan the QR code on your physical card first.");
      return;
    }
    
    if (!claimCode.trim()) {
      toast.error("Please enter the claim code from your physical card.");
      return;
    }
    
    const toastId = toast.loading("Claiming card...");
    try {
      const result = await addWithClaimCode({ 
        token, 
        cardId: card._id,
        claimCode: claimCode.trim()
      });
      if (result.success) {
        toast.success(result.message, { id: toastId });
        setShowClaimDialog(false);
        setClaimCode("");
        setIsVerified(false);
        setSearchParams({});
      } else {
        toast.error(result.message, { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to claim card.", { id: toastId });
    }
  };

  const handleCreateAndEdit = async () => {
    if (!user || !token || !customId) {
      toast.error("You must be logged in and have a card ID to create a card.");
      return;
    }
    const toastId = toast.loading("Creating new card...");
    try {
      await createCardWithId({ token, customId });
      toast.success("New card created! Redirecting to editor...", { id: toastId });
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate(`/editor/card/${customId}`);
    } catch (error: any) {
      toast.error(`Failed to create new card: ${error.message}`, { id: toastId });
      console.error(error);
    }
  };

  const handleDeleteCard = async () => {
    if (!token || !card) return;
    if (window.confirm("Are you sure you want to delete this card? This action cannot be undone.")) {
      const toastId = toast.loading("Deleting card...");
      try {
        await deleteCardMutation({ token, cardId: card._id });
        toast.success("Card deleted successfully.", { id: toastId });
        navigate("/all-cards");
      } catch (error) {
        toast.error("Failed to delete card.", { id: toastId });
        console.error(error);
      }
    }
  };

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
    const role = (user?.role ?? "").toString().toLowerCase();
    const isAuthorizedCreator = !!user && (role === "admin" || role === "owner" || role === "card_setter");

    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl font-bold mb-4">Card Not Found</h1>
            <p className="text-slate-400 mb-6">The card ID you've entered does not exist.</p>
            {isAuthorizedCreator ? (
                <Card className="max-w-sm bg-slate-900 border-red-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-400">
                            <FilePlus2 />
                            Create a New Card?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-300 mb-3">
                          You can create a new card using this exact ID:
                        </p>
                        <div className="text-xs md:text-sm font-mono bg-black/40 border border-red-500/20 text-red-300 rounded px-2 py-1 break-all">
                          /cards/{customId}
                        </div>
                      </CardContent>
                    <CardFooter>
                         <Button onClick={handleCreateAndEdit} className="w-full bg-red-600 hover:bg-red-700 text-white">
                            Create Card with this ID & Edit
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                 <Button onClick={() => navigate('/dashboard')} variant="outline">
                    Back to Dashboard
                </Button>
            )}
        </div>
      </DashboardLayout>
    );
  }

  const isAuthorizedEditor = user && ["admin", "owner", "cardsetter"].includes(user.role!);
  const cardIsInInventory = !!userCard;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 flex flex-col justify-center items-center gap-4">
        {/* QR Verification Alert */}
        {!isVerified && user && (
          <Alert className="max-w-md bg-yellow-900/20 border-yellow-500/50">
            <QrCode className="h-4 w-4" />
            <AlertDescription className="text-yellow-200">
              To claim this card, please scan the QR code on your physical card first.
            </AlertDescription>
          </Alert>
        )}

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
                            <p className="text-slate-200">{card.rarity}</p>
                        </Card>
                        <Card className="bg-slate-900 p-3">
                            <p className="font-semibold text-slate-500">Frame</p>
                            <p className="text-slate-200">{card.frame}</p>
                        </Card>
                        <Card className="bg-slate-900 p-3">
                            <p className="font-semibold text-slate-500">Batch</p>
                            <p className="text-slate-200">{card.batch}</p>
                        </Card>
                        <Card className="bg-slate-900 p-3">
                            <p className="font-semibold text-slate-500">Numbering</p>
                            <p className="text-slate-200">{card.numberingA}/{card.numberingB}</p>
                        </Card>
                        <Card className="bg-slate-900 p-3 col-span-2">
                            <p className="font-semibold text-slate-500">Signed</p>
                            <p className="text-slate-200">{card.signed}</p>
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
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isVerified) {
                            toast.error("Please scan the QR code on your physical card first");
                            return;
                          }
                          setShowClaimDialog(true);
                        }} 
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        disabled={cardIsInInventory || !isVerified}
                      >
                          {cardIsInInventory ? "Card in Inventory" : isVerified ? "Claim Card" : "Scan QR Code First"}
                      </Button>
                  )}
                  {isAuthorizedEditor && (
                    <div className="w-full grid grid-cols-2 gap-2">
                      <Link to={`/editor/card/${card.customId}`} className="w-full">
                          <Button variant="outline" className="w-full border-red-500 text-red-400 hover:bg-red-500/10">Edit Card</Button>
                      </Link>
                      <Button variant="destructive" className="w-full" onClick={handleDeleteCard}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
              </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Claim Code Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="bg-slate-900 border-red-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Claim Card</DialogTitle>
            <DialogDescription className="text-slate-300">
              Enter the unique claim code printed on your physical card to add it to your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="claimCode" className="text-slate-200">Claim Code</Label>
              <Input
                id="claimCode"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder="Enter claim code"
                className="bg-slate-800 border-slate-700 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleClaimCard();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClaimDialog(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleClaimCard} className="bg-red-600 hover:bg-red-700">
              Claim Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}