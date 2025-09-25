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
import { Textarea } from "@/components/ui/textarea";
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

  // Add state for creation dialogs and forms
  const [newRarityOpen, setNewRarityOpen] = useState(false);
  const [newUpgradeOpen, setNewUpgradeOpen] = useState(false);
  const [newCardOpen, setNewCardOpen] = useState(false);

  const [rarityName, setRarityName] = useState("");
  const [rarityCode, setRarityCode] = useState("");
  const [rarityDesc, setRarityDesc] = useState("");

  const [upgradeName, setUpgradeName] = useState("");
  const [upgradeDesc, setUpgradeDesc] = useState("");

  const [cardCustomId, setCardCustomId] = useState("");
  const [cardType, setCardType] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardHealth, setCardHealth] = useState("");
  const [attackSlots, setAttackSlots] = useState("0");
  const [abilitySlots, setAbilitySlots] = useState("0");
  const [passiveSlots, setPassiveSlots] = useState("");
  const [cardRarityId, setCardRarityId] = useState<string>("");
  const [cardUpgradeId, setCardUpgradeId] = useState<string>("");

  // State and queries for Attacks/Passives/Abilities
  const attacks = useQuery(api.cardInfo.listAttacks);
  const passives = useQuery(api.cardInfo.listPassives);
  const abilities = useQuery(api.cardInfo.listAbilities);

  const [newAttackOpen, setNewAttackOpen] = useState(false);
  const [newPassiveOpen, setNewPassiveOpen] = useState(false);
  const [newAbilityOpen, setNewAbilityOpen] = useState(false);

  const [attackName, setAttackName] = useState("");
  const [attackDesc, setAttackDesc] = useState("");
  const [attackTypeField, setAttackTypeField] = useState("");
  const [attackSubject, setAttackSubject] = useState("");
  const [attackDamage, setAttackDamage] = useState("");
  const [attackHeal, setAttackHeal] = useState("");
  const [attackValue, setAttackValue] = useState("");

  const [passiveName, setPassiveName] = useState("");
  const [passiveDesc, setPassiveDesc] = useState("");
  const [passiveType, setPassiveType] = useState<"DAMAGE_BOOST" | "HEALTH_BOOST" | "DEFENCE" | "AUTO_HEAL_SELF" | "AUTO_HEAL_ALLY">("DAMAGE_BOOST");

  const [abilityName, setAbilityName] = useState("");
  const [abilityDesc, setAbilityDesc] = useState("");
  const [abilityType, setAbilityType] = useState<"DESTROY_TARGET" | "STUN" | "LONG_STUN" | "EXTRA_LONG_STUN" | "BOOST_ALL_ALLIES" | "HEAL_ALLIES" | "MULTIPLE_TARGETS" | "REVIVE" | "REUSE" | "MULTIPLE_TURNS">("STUN");
  const [abilityValue, setAbilityValue] = useState("");

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
  const createRarity = useMutation(api.cardInfo.createRarity);
  const createUpgradeMut = useMutation(api.cardInfo.createUpgrade);
  const createCard = useMutation(api.cardInfo.createCard);
  const createAttack = useMutation(api.cardInfo.createAttack);
  const createPassive = useMutation(api.cardInfo.createPassive);
  const createAbility = useMutation(api.cardInfo.createAbility);

  const handleCreateRarity = async () => {
    if (!token) return;
    if (!rarityName.trim() || !rarityCode.trim()) {
      toast.error("Name and Code are required");
      return;
    }
    try {
      await createRarity({ token, name: rarityName.trim(), code: rarityCode.trim(), description: rarityDesc.trim() || undefined });
      toast.success("Rarity created");
      setNewRarityOpen(false);
      setRarityName(""); setRarityCode(""); setRarityDesc("");
    } catch (e: any) {
      toast.error(e.message || "Failed to create rarity");
    }
  };

  const handleCreateUpgrade = async () => {
    if (!token) return;
    if (!upgradeName.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await createUpgradeMut({ token, name: upgradeName.trim(), description: upgradeDesc.trim() || undefined });
      toast.success("Upgrade created");
      setNewUpgradeOpen(false);
      setUpgradeName(""); setUpgradeDesc("");
    } catch (e: any) {
      toast.error(e.message || "Failed to create upgrade");
    }
  };

  const handleCreateCard = async () => {
    if (!token) return;
    const h = parseInt(cardHealth);
    const aS = parseInt(attackSlots);
    const abS = parseInt(abilitySlots);
    const pS = passiveSlots ? parseInt(passiveSlots) : undefined;

    if (!cardCustomId.trim() || !cardType.trim() || !cardName.trim() || Number.isNaN(h)) {
      toast.error("Custom ID, Type, Name, and Health are required");
      return;
    }
    if (Number.isNaN(aS) || Number.isNaN(abS)) {
      toast.error("Attack/Ability slots must be numbers");
      return;
    }

    try {
      await createCard({
        token,
        customId: cardCustomId.trim(),
        cardType: cardType.trim(),
        cardName: cardName.trim(),
        health: h,
        attackSlots: aS,
        abilitySlots: abS,
        passiveSlots: pS,
        rarityId: cardRarityId ? (cardRarityId as unknown as Id<"rarities">) : undefined,
        upgradeId: cardUpgradeId ? (cardUpgradeId as unknown as Id<"upgrades">) : undefined,
      });
      toast.success("Card created");
      setNewCardOpen(false);
      setCardCustomId(""); setCardType(""); setCardName(""); setCardHealth("");
      setAttackSlots("0"); setAbilitySlots("0"); setPassiveSlots(""); setCardRarityId(""); setCardUpgradeId("");
    } catch (e: any) {
      toast.error(e.message || "Failed to create card");
    }
  };

  const handleCreateAttack = async () => {
    if (!token) return;
    if (!attackName.trim() || !attackDesc.trim() || !attackTypeField.trim()) {
      toast.error("Name, Description, and Type are required");
      return;
    }
    try {
      await createAttack({
        token,
        name: attackName.trim(),
        description: attackDesc.trim(),
        attackType: attackTypeField.trim(),
        subject: attackSubject.trim() || undefined,
        damage: attackDamage ? parseInt(attackDamage) : undefined,
        heal: attackHeal ? parseInt(attackHeal) : undefined,
        value: attackValue ? parseInt(attackValue) : undefined,
      });
      toast.success("Attack created");
      setNewAttackOpen(false);
      setAttackName(""); setAttackDesc(""); setAttackTypeField(""); setAttackSubject(""); setAttackDamage(""); setAttackHeal(""); setAttackValue("");
    } catch (e: any) {
      toast.error(e.message || "Failed to create attack");
    }
  };

  const handleCreatePassive = async () => {
    if (!token) return;
    if (!passiveName.trim() || !passiveDesc.trim()) {
      toast.error("Name and Description are required");
      return;
    }
    try {
      await createPassive({
        token,
        name: passiveName.trim(),
        description: passiveDesc.trim(),
        type: passiveType,
      });
      toast.success("Passive created");
      setNewPassiveOpen(false);
      setPassiveName(""); setPassiveDesc(""); setPassiveType("DAMAGE_BOOST");
    } catch (e: any) {
      toast.error(e.message || "Failed to create passive");
    }
  };

  const handleCreateAbility = async () => {
    if (!token) return;
    if (!abilityName.trim() || !abilityDesc.trim()) {
      toast.error("Name and Description are required");
      return;
    }
    try {
      await createAbility({
        token,
        name: abilityName.trim(),
        description: abilityDesc.trim(),
        type: abilityType,
        value: abilityValue ? parseInt(abilityValue) : undefined,
      });
      toast.success("Ability created");
      setNewAbilityOpen(false);
      setAbilityName(""); setAbilityDesc(""); setAbilityType("STUN"); setAbilityValue("");
    } catch (e: any) {
      toast.error(e.message || "Failed to create ability");
    }
  };

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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-red-400 flex items-center gap-2">
                Card Names ({cardNames.length})
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setNewCardOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                New Card
              </Button>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-red-400 flex items-center gap-2">
                Upgrades ({upgrades.length})
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setNewUpgradeOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                New Upgrade
              </Button>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-red-400 flex items-center gap-2">
                Rarities ({rarities.length})
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setNewRarityOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                New Rarity
              </Button>
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

        {/* New rows for Attacks / Passives / Abilities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Attacks */}
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-red-400">Attacks ({attacks?.length ?? 0})</CardTitle>
              <Button size="sm" onClick={() => setNewAttackOpen(true)} className="bg-red-600 hover:bg-red-700">
                New Attack
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {attacks?.map((a) => (
                <div key={a._id} className="p-2 bg-slate-800/50 rounded">
                  <div className="text-slate-300 font-medium">{a.name} <span className="text-xs text-slate-500">({a.attackType})</span></div>
                  <div className="text-xs text-slate-500">{a.description}</div>
                  {(a.damage || a.heal || a.value) && (
                    <div className="text-xs text-slate-500">
                      {a.damage ? `Damage: ${a.damage} ` : ""}{a.heal ? `Heal: ${a.heal} ` : ""}{a.value ? `Value: ${a.value}` : ""}
                    </div>
                  )}
                </div>
              ))}
              {(!attacks || attacks.length === 0) && <p className="text-slate-400 text-center py-4">No attacks found</p>}
            </CardContent>
          </Card>

          {/* Passives */}
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-red-400">Passives ({passives?.length ?? 0})</CardTitle>
              <Button size="sm" onClick={() => setNewPassiveOpen(true)} className="bg-red-600 hover:bg-red-700">
                New Passive
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {passives?.map((p) => (
                <div key={p._id} className="p-2 bg-slate-800/50 rounded">
                  <div className="text-slate-300 font-medium">{p.name} <span className="text-xs text-slate-500">({p.type})</span></div>
                  <div className="text-xs text-slate-500">{p.description}</div>
                </div>
              ))}
              {(!passives || passives.length === 0) && <p className="text-slate-400 text-center py-4">No passives found</p>}
            </CardContent>
          </Card>

          {/* Abilities */}
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-red-400">Abilities ({abilities?.length ?? 0})</CardTitle>
              <Button size="sm" onClick={() => setNewAbilityOpen(true)} className="bg-red-600 hover:bg-red-700">
                New Ability
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {abilities?.map((ab) => (
                <div key={ab._id} className="p-2 bg-slate-800/50 rounded">
                  <div className="text-slate-300 font-medium">{ab.name} <span className="text-xs text-slate-500">({ab.type})</span></div>
                  <div className="text-xs text-slate-500">{ab.description}</div>
                  {ab.value !== undefined && <div className="text-xs text-slate-500">Value: {ab.value}</div>}
                </div>
              ))}
              {(!abilities || abilities.length === 0) && <p className="text-slate-400 text-center py-4">No abilities found</p>}
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

        {/* Dialogs: Create Rarity */}
        <Dialog open={newRarityOpen} onOpenChange={setNewRarityOpen}>
          <DialogContent className="bg-slate-900 border-red-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400">New Rarity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rarityName">Name</Label>
                <Input id="rarityName" value={rarityName} onChange={(e) => setRarityName(e.target.value)} placeholder="e.g., Rare" />
              </div>
              <div>
                <Label htmlFor="rarityCode">Code</Label>
                <Input id="rarityCode" value={rarityCode} onChange={(e) => setRarityCode(e.target.value)} placeholder="e.g., R" />
              </div>
              <div>
                <Label htmlFor="rarityDesc">Description</Label>
                <Textarea id="rarityDesc" value={rarityDesc} onChange={(e) => setRarityDesc(e.target.value)} placeholder="Optional description" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewRarityOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRarity} className="bg-red-600 hover:bg-red-700">Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogs: Create Upgrade */}
        <Dialog open={newUpgradeOpen} onOpenChange={setNewUpgradeOpen}>
          <DialogContent className="bg-slate-900 border-red-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400">New Upgrade</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="upgradeName">Name</Label>
                <Input id="upgradeName" value={upgradeName} onChange={(e) => setUpgradeName(e.target.value)} placeholder="e.g., Fire Enhancement" />
              </div>
              <div>
                <Label htmlFor="upgradeDesc">Description</Label>
                <Textarea id="upgradeDesc" value={upgradeDesc} onChange={(e) => setUpgradeDesc(e.target.value)} placeholder="Optional description" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewUpgradeOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateUpgrade} className="bg-red-600 hover:bg-red-700">Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogs: Create Card */}
        <Dialog open={newCardOpen} onOpenChange={setNewCardOpen}>
          <DialogContent className="bg-slate-900 border-red-500/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-red-400">New Card</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardCustomId">Custom ID</Label>
                <Input id="cardCustomId" value={cardCustomId} onChange={(e) => setCardCustomId(e.target.value)} placeholder="e.g., WARRIOR_002" />
              </div>
              <div>
                <Label htmlFor="cardType">Card Type</Label>
                <Input id="cardType" value={cardType} onChange={(e) => setCardType(e.target.value)} placeholder="e.g., Character" />
              </div>
              <div>
                <Label htmlFor="cardName">Card Name</Label>
                <Input id="cardName" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="e.g., Flame Knight" />
              </div>
              <div>
                <Label htmlFor="cardHealth">Health</Label>
                <Input id="cardHealth" type="number" value={cardHealth} onChange={(e) => setCardHealth(e.target.value)} placeholder="e.g., 100" />
              </div>
              <div>
                <Label htmlFor="attackSlots">Attack Slots</Label>
                <Input id="attackSlots" type="number" value={attackSlots} onChange={(e) => setAttackSlots(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="abilitySlots">Ability Slots</Label>
                <Input id="abilitySlots" type="number" value={abilitySlots} onChange={(e) => setAbilitySlots(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="passiveSlots">Passive Slots (optional)</Label>
                <Input id="passiveSlots" type="number" value={passiveSlots} onChange={(e) => setPassiveSlots(e.target.value)} />
              </div>
              <div>
                <Label>Rarity (optional)</Label>
                <Select value={cardRarityId} onValueChange={(v) => setCardRarityId(v)}>
                  <SelectTrigger><SelectValue placeholder="Select rarity" /></SelectTrigger>
                  <SelectContent>
                    {rarities?.map(r => (
                      <SelectItem key={r._id} value={r._id as unknown as string}>{r.name} ({r.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Upgrade (optional)</Label>
                <Select value={cardUpgradeId} onValueChange={(v) => setCardUpgradeId(v)}>
                  <SelectTrigger><SelectValue placeholder="Select upgrade" /></SelectTrigger>
                  <SelectContent>
                    {upgrades?.map(u => (
                      <SelectItem key={u._id} value={u._id as unknown as string}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setNewCardOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateCard} className="bg-red-600 hover:bg-red-700">Create</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogs: New Attack */}
        <Dialog open={newAttackOpen} onOpenChange={setNewAttackOpen}>
          <DialogContent className="bg-slate-900 border-red-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400">New Attack</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={attackName} onChange={(e) => setAttackName(e.target.value)} /></div>
              <div><Label>Description</Label><Textarea value={attackDesc} onChange={(e) => setAttackDesc(e.target.value)} /></div>
              <div><Label>Type</Label><Input value={attackTypeField} onChange={(e) => setAttackTypeField(e.target.value)} placeholder="e.g., Fire, Melee, Ranged" /></div>
              <div><Label>Subject (optional)</Label><Input value={attackSubject} onChange={(e) => setAttackSubject(e.target.value)} /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><Label>Damage</Label><Input type="number" value={attackDamage} onChange={(e) => setAttackDamage(e.target.value)} /></div>
                <div><Label>Heal</Label><Input type="number" value={attackHeal} onChange={(e) => setAttackHeal(e.target.value)} /></div>
                <div><Label>Value</Label><Input type="number" value={attackValue} onChange={(e) => setAttackValue(e.target.value)} /></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewAttackOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateAttack} className="bg-red-600 hover:bg-red-700">Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogs: New Passive */}
        <Dialog open={newPassiveOpen} onOpenChange={setNewPassiveOpen}>
          <DialogContent className="bg-slate-900 border-red-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400">New Passive</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={passiveName} onChange={(e) => setPassiveName(e.target.value)} /></div>
              <div><Label>Description</Label><Textarea value={passiveDesc} onChange={(e) => setPassiveDesc(e.target.value)} /></div>
              <div>
                <Label>Type</Label>
                <Select value={passiveType} onValueChange={(v: any) => setPassiveType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAMAGE_BOOST">Damage Boost</SelectItem>
                    <SelectItem value="HEALTH_BOOST">Health Boost</SelectItem>
                    <SelectItem value="DEFENCE">Defence</SelectItem>
                    <SelectItem value="AUTO_HEAL_SELF">Auto Heal Self</SelectItem>
                    <SelectItem value="AUTO_HEAL_ALLY">Auto Heal Ally</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewPassiveOpen(false)}>Cancel</Button>
                <Button onClick={handleCreatePassive} className="bg-red-600 hover:bg-red-700">Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogs: New Ability */}
        <Dialog open={newAbilityOpen} onOpenChange={setNewAbilityOpen}>
          <DialogContent className="bg-slate-900 border-red-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400">New Ability</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={abilityName} onChange={(e) => setAbilityName(e.target.value)} /></div>
              <div><Label>Description</Label><Textarea value={abilityDesc} onChange={(e) => setAbilityDesc(e.target.value)} /></div>
              <div>
                <Label>Type</Label>
                <Select value={abilityType} onValueChange={(v: any) => setAbilityType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESTROY_TARGET">Destroy Target</SelectItem>
                    <SelectItem value="STUN">Stun</SelectItem>
                    <SelectItem value="LONG_STUN">Long Stun</SelectItem>
                    <SelectItem value="EXTRA_LONG_STUN">Extra Long Stun</SelectItem>
                    <SelectItem value="BOOST_ALL_ALLIES">Boost All Allies</SelectItem>
                    <SelectItem value="HEAL_ALLIES">Heal Allies</SelectItem>
                    <SelectItem value="MULTIPLE_TARGETS">Multiple Targets</SelectItem>
                    <SelectItem value="REVIVE">Revive</SelectItem>
                    <SelectItem value="REUSE">Reuse</SelectItem>
                    <SelectItem value="MULTIPLE_TURNS">Multiple Turns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Value (optional)</Label><Input type="number" value={abilityValue} onChange={(e) => setAbilityValue(e.target.value)} /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewAbilityOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateAbility} className="bg-red-600 hover:bg-red-700">Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}