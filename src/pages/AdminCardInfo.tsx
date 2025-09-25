import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Trash2, Edit, Plus } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminCardInfo() {
  const { token } = useAuth();
  const [selectedCardId, setSelectedCardId] = useState<Id<"cards"> | null>(null);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedUpgradeId, setSelectedUpgradeId] = useState<Id<"upgrades"> | null>(null);
  const [newUpgradeName, setNewUpgradeName] = useState("");
  const [batchType, setBatchType] = useState<"NORMAL" | "EXCLUSIVE" | "LIMITED">("NORMAL");
  const [maxSupply, setMaxSupply] = useState("");

  // Queries
  const cardNames = useQuery(api.cardInfo.listCardNames);
  const upgrades = useQuery(api.cardInfo.listUpgrades);
  const rarities = useQuery(api.cardInfo.listRarities);
  const batches = useQuery(
    api.cardInfo.listBatchesForCard,
    selectedCardId ? { cardId: selectedCardId } : "skip"
  );

  // Mutations
  const deleteCard = useMutation(api.cardInfo.deleteCard);
  const deleteUpgrade = useMutation(api.cardInfo.deleteUpgrade);
  const renameUpgrade = useMutation(api.cardInfo.renameUpgrade);
  const addBatch = useMutation(api.cardInfo.addBatch);

  const handleDeleteCard = async (cardId: Id<"cards">, cardName: string) => {
    if (!token) return;
    if (!confirm(`Delete card "${cardName}"? This will also delete all batches and user ownership.`)) return;

    try {
      await deleteCard({ token, cardId });
      toast.success("Card deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete card: ${error.message}`);
    }
  };

  const handleDeleteUpgrade = async (upgradeId: Id<"upgrades">, upgradeName: string) => {
    if (!token) return;
    if (!confirm(`Delete upgrade "${upgradeName}"?`)) return;

    try {
      await deleteUpgrade({ token, upgradeId });
      toast.success("Upgrade deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete upgrade: ${error.message}`);
    }
  };

  const handleRenameUpgrade = async () => {
    if (!token || !selectedUpgradeId || !newUpgradeName.trim()) return;

    try {
      await renameUpgrade({ token, upgradeId: selectedUpgradeId, newName: newUpgradeName.trim() });
      toast.success("Upgrade renamed successfully");
      setRenameDialogOpen(false);
      setNewUpgradeName("");
      setSelectedUpgradeId(null);
    } catch (error: any) {
      toast.error(`Failed to rename upgrade: ${error.message}`);
    }
  };

  const handleAddBatch = async () => {
    if (!token || !selectedCardId) return;

    const maxSupplyNum = batchType === "NORMAL" ? parseInt(maxSupply) : undefined;
    if (batchType === "NORMAL" && (!maxSupplyNum || maxSupplyNum <= 0)) {
      toast.error("Please enter a valid max supply for normal batches");
      return;
    }

    try {
      await addBatch({ 
        token, 
        cardId: selectedCardId, 
        type: batchType, 
        maxSupply: maxSupplyNum 
      });
      toast.success("Batch created successfully");
      setBatchDialogOpen(false);
      setMaxSupply("");
      setBatchType("NORMAL");
    } catch (error: any) {
      toast.error(`Failed to create batch: ${error.message}`);
    }
  };

  const openRenameDialog = (upgradeId: Id<"upgrades">, currentName: string) => {
    setSelectedUpgradeId(upgradeId);
    setNewUpgradeName(currentName);
    setRenameDialogOpen(true);
  };

  if (cardNames === undefined || upgrades === undefined || rarities === undefined) {
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
      <Helmet>
        <title>Card Info | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
        <meta name="description" content="Administrative card information and management hub." />
      </Helmet>

      <div className="container mx-auto py-8 text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-red-400">Card Management Hub</h1>
          <div className="flex gap-3">
            <Link to="/admin">
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                Back to Admin
              </Button>
            </Link>
            <Link to="/all-cards">
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                View All Cards
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Names Section */}
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                Card Names ({cardNames.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {cardNames.map((card) => (
                <div key={card._id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                  <button
                    onClick={() => setSelectedCardId(card._id)}
                    className="flex-1 text-left text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <div className="font-medium">{card.cardName}</div>
                    <div className="text-xs text-slate-500">{card.customId} • {card.cardType}</div>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCard(card._id, card.cardName)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {cardNames.length === 0 && (
                <p className="text-slate-400 text-center py-4">No cards found</p>
              )}
            </CardContent>
          </Card>

          {/* Upgrades Section */}
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                Upgrades ({upgrades.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {upgrades.map((upgrade) => (
                <div key={upgrade._id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                  <div className="flex-1 text-slate-300">
                    <div className="font-medium">{upgrade.name}</div>
                    {upgrade.description && (
                      <div className="text-xs text-slate-500">{upgrade.description}</div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRenameDialog(upgrade._id, upgrade.name)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUpgrade(upgrade._id, upgrade.name)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {upgrades.length === 0 && (
                <p className="text-slate-400 text-center py-4">No upgrades found</p>
              )}
            </CardContent>
          </Card>

          {/* Rarities Section */}
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                Rarities ({rarities.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {rarities.map((rarity) => (
                <div key={rarity._id} className="p-2 bg-slate-800/50 rounded">
                  <div className="text-slate-300 font-medium">{rarity.name}</div>
                  <div className="text-xs text-slate-500">Code: {rarity.code}</div>
                  {rarity.description && (
                    <div className="text-xs text-slate-500">{rarity.description}</div>
                  )}
                </div>
              ))}
              {rarities.length === 0 && (
                <p className="text-slate-400 text-center py-4">No rarities found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Card Details Dialog */}
        {selectedCardId && (
          <Dialog open={!!selectedCardId} onOpenChange={() => setSelectedCardId(null)}>
            <DialogContent className="bg-slate-900 border-red-500/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-red-400">
                  {cardNames.find(c => c._id === selectedCardId)?.cardName} - Batches
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Existing Batches</h3>
                  <Button
                    onClick={() => setBatchDialogOpen(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Batch
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {batches?.map((batch) => (
                    <div key={batch._id} className="p-3 bg-slate-800/50 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-red-400">Batch {batch.label}</div>
                          <div className="text-sm text-slate-300">Type: {batch.type}</div>
                          {batch.maxSupply && (
                            <div className="text-sm text-slate-300">
                              Supply: {batch.minted}/{batch.maxSupply}
                            </div>
                          )}
                          <div className="text-xs text-slate-500">
                            Status: {batch.isComplete ? "Complete" : "Incomplete"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!batches || batches.length === 0) && (
                    <p className="text-slate-400 text-center py-4">No batches found</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Batch Dialog */}
        <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
          <DialogContent className="bg-slate-900 border-red-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400">Add New Batch</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="batchType">Batch Type</Label>
                <Select value={batchType} onValueChange={(value: any) => setBatchType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="EXCLUSIVE">Exclusive</SelectItem>
                    <SelectItem value="LIMITED">Limited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {batchType === "NORMAL" && (
                <div>
                  <Label htmlFor="maxSupply">Max Supply</Label>
                  <Input
                    id="maxSupply"
                    type="number"
                    value={maxSupply}
                    onChange={(e) => setMaxSupply(e.target.value)}
                    placeholder="Enter max supply"
                    min="1"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setBatchDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBatch} className="bg-red-600 hover:bg-red-700">
                  Create Batch
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rename Upgrade Dialog */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent className="bg-slate-900 border-red-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400">Rename Upgrade</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="newName">New Name</Label>
                <Input
                  id="newName"
                  value={newUpgradeName}
                  onChange={(e) => setNewUpgradeName(e.target.value)}
                  placeholder="Enter new upgrade name"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRenameUpgrade} className="bg-red-600 hover:bg-red-700">
                  Rename
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}