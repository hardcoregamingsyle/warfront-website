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

export default function CardEditor() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const card = useQuery(api.cards.get, { cardId: cardId as Id<"cards"> });
  const updateCard = useMutation(api.cards.update);

  const [selectedCardType, setSelectedCardType] = useState<string | undefined>();
  const [selectedCardName, setSelectedCardName] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>(card?.imageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (card) {
      setSelectedCardType(card.cardType);
      setSelectedCardName(card.cardName);
      setImageUrl(card.imageUrl);
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

  if (
    user === null ||
    !["admin", "owner", "cardsetter"].includes(user.role!)
  ) {
    navigate("/dashboard");
    return null;
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // This is where Cloudinary upload logic will go
    // For now, we'll simulate it
    setIsUploading(true);
    toast.info("Cloudinary integration not yet configured. Using placeholder.");
    // In a real scenario, you would call a Convex action that uploads to Cloudinary
    // and returns the URL.
    setTimeout(() => {
        const placeholderUrl = "https://via.placeholder.com/300x400";
        setImageUrl(placeholderUrl);
        setIsUploading(false);
        toast.success("Image uploaded (placeholder).");
    }, 2000);
  };

  const handleSave = async () => {
    if (!selectedCardType || !selectedCardName || !token) {
      toast.error("Please select a card type and name.");
      return;
    }
    setIsSaving(true);
    try {
      await updateCard({
        cardId: cardId as Id<"cards">,
        cardType: selectedCardType,
        cardName: selectedCardName,
        imageUrl: imageUrl,
        token: token,
      });
      toast.success("Card saved successfully!");
    } catch (error) {
      toast.error("Failed to save card.");
    } finally {
      setIsSaving(false);
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

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Card
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}