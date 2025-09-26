import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Loader2 } from "lucide-react";

const cardTypes = {
  Ammo: ["Missile", "5 Munition", "Grenade", "10 Munition", "20 Munition"],
  Soldier: [
    "Wolf",
    "Wolf V",
    "Wolf VMax",
    "Wolf VStar",
    "Ripper",
    "Ripper V",
    "Ripper VMax",
    "Ripper VStar",
  ],
  Plane: [
    "MiG-29",
    "MiG-29 V",
    "MiG-29 VMax",
    "MiG-29 VStar",
    "SR-71 Blackbird",
    "SR-71 V",
    "SR-71 VMax",
    "SR-71 VStar",
  ],
  Defence: [
    "S-400",
    "Irondome",
    "S-400 V",
    "Irondome V",
    "S-400 VMax",
    "S-400 VStar",
    "Irondome VMax",
    "Irondome VStar",
  ],
  Trainer: [
    "Major Jaswant Sigh",
    "Rifleman Jaswant Sigh",
    "Simo Häyhä",
    "Audie Murphy",
    "Alvin C. York",
  ],
  Asset: [
    "5 Money",
    "5 Fuel",
    "10 Money",
    "10 Fuel",
    "20 Money",
    "20 Fuel",
  ],
  Transport: [
    "INS Vikrant",
    "C-130 HERCUELS",
    "C-17 GLOBEMASTER",
    "A400M ATLAS",
  ],
};

const rarities = ["Common", "Uncommon", "EX", "Rare", "Legendary", "GX", "VMax", "Mythical", "VStar", "Secret"];
const frames = ["Plain", "Silver", "Gold", "Rainbow"];
const batches = ["A", "B", "C", "D", "F", "L(Limited Time)", "E(Exclusive)"];
const signedOptions = ["No", "Nitish", "Aditya", "Both"];

export default function CardEditor() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const card = useQuery(api.cards.get, cardId ? { customId: cardId } : "skip");
  const updateCard = useMutation(api.cards.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [selectedCardType, setSelectedCardType] = useState<string | undefined>();
  const [selectedCardName, setSelectedCardName] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [rarity, setRarity] = useState<string | undefined>(card?.rarity);
  const [frame, setFrame] = useState<string | undefined>(card?.frame);
  const [batch, setBatch] = useState<string | undefined>(card?.batch);
  const [numberingA, setNumberingA] = useState<number | undefined>(card?.numberingA);
  const [numberingB, setNumberingB] = useState<number | undefined>(card?.numberingB);
  const [signed, setSigned] = useState<string | undefined>(card?.signed);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (card) {
      setSelectedCardType(card.cardType);
      setSelectedCardName(card.cardName);
      setImageUrl(card.imageUrl || undefined);
      setRarity(card.rarity);
      setFrame(card.frame);
      setBatch(card.batch);
      setNumberingA(card.numberingA);
      setNumberingB(card.numberingB);
      setSigned(card.signed);
    }
  }, [card]);

  useEffect(() => {
    // If the query finishes and the card is null, it means it doesn't exist.
    if (card === null) {
      toast.error("Card not found.");
      navigate("/dashboard");
    }
  }, [card, navigate]);

  if (user === undefined || card === undefined) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Normalize role and email for robust authorization
  const roleNorm = (user?.role ?? "").toString().toLowerCase().replace(/[\s_-]+/g, "");
  const emailNorm = (user?.email ?? "").toString().toLowerCase();
  const isPrivileged = ["admin", "owner", "cardsetter"].includes(roleNorm) || emailNorm === "hardcorgamingstyle@gmail.com";

  if (user === null || !isPrivileged) {
    navigate("/dashboard");
    return null;
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !card || !token) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });
        const { storageId } = await result.json();

        await updateCard({
            cardId: card._id,
            cardType: selectedCardType || "",
            cardName: selectedCardName || "",
            imageId: storageId,
            rarity,
            frame,
            batch,
            numberingA,
            numberingB,
            signed,
            token,
        });
        toast.success("Image uploaded and saved.", { id: toastId });
    } catch (error) {
        console.error(error);
        toast.error("Image upload failed.", { id: toastId });
    } finally {
        setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!card || !token) return;
    
    const toastId = toast.loading("Saving card...");
    try {
      await updateCard({
        cardId: card._id,
        cardType: selectedCardType || "",
        cardName: selectedCardName || "",
        imageId: card.imageId,
        rarity,
        frame,
        batch,
        numberingA,
        numberingB,
        signed,
        token,
      });
      toast.success("Card saved successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to save card.", { id: toastId });
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Digital Card</h1>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <Label>Card Image</Label>
            <Input type="file" onChange={handleImageUpload} disabled={isUploading} />
            {isUploading && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
            {imageUrl && <img src={imageUrl} alt="Card preview" className="mt-4 rounded-lg" />}
          </div>

          <div>
            <Label>Card Type</Label>
            <Select
              onValueChange={setSelectedCardType}
              defaultValue={selectedCardType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a card type" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(cardTypes).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCardType && (
            <div>
              <Label>Card Name</Label>
              <Select
                onValueChange={setSelectedCardName}
                defaultValue={selectedCardName}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a card name" />
                </SelectTrigger>
                <SelectContent>
                  {(cardTypes[selectedCardType as keyof typeof cardTypes] || []).map(
                    (name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Rarity</Label>
            <Select onValueChange={setRarity} defaultValue={rarity}>
              <SelectTrigger>
                <SelectValue placeholder="Select rarity" />
              </SelectTrigger>
              <SelectContent>
                {rarities.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Frame</Label>
            <Select onValueChange={setFrame} defaultValue={frame}>
              <SelectTrigger>
                <SelectValue placeholder="Select frame" />
              </SelectTrigger>
              <SelectContent>
                {frames.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Batch</Label>
            <Select onValueChange={setBatch} defaultValue={batch}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Numbering</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={numberingA ?? ""}
                onChange={(e) => setNumberingA(parseInt(e.target.value))}
                placeholder="A"
              />
              <span>/</span>
              <Input
                type="number"
                value={numberingB ?? ""}
                onChange={(e) => setNumberingB(parseInt(e.target.value))}
                placeholder="B"
              />
            </div>
          </div>

          <div>
            <Label>Signed</Label>
            <Select onValueChange={setSigned} defaultValue={signed}>
              <SelectTrigger>
                <SelectValue placeholder="Select signed status" />
              </SelectTrigger>
              <SelectContent>
                {signedOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Card
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}