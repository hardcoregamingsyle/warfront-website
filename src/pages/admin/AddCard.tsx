import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function AdminAddCard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [customId, setCustomId] = useState("");
  const createCard = useMutation(api.cards.createCardWithId);

  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();
  const isAuthorized =
    !!user &&
    (roleLc === "admin" || roleLc === "owner" || emailLc === "hardcorgamingstyle@gmail.com");

  const handleCreateCard = async () => {
    if (!token || !customId.trim()) {
      toast.error("Please enter a card ID");
      return;
    }

    try {
      const cardId = await createCard({ token, customId: customId.trim() });
      toast.success("Card created successfully");
      navigate(`/editor/card/${cardId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create card");
    }
  };

  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <Helmet>
          <title>Access Denied | Warfront</title>
        </Helmet>
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
      <Helmet>
        <title>Add Card | Warfront Admin</title>
      </Helmet>

      <div className="container mx-auto py-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-red-400 mb-6">Add New Card</h1>

        <Card className="bg-slate-900/50 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">Create Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Card ID</label>
              <Input
                placeholder="Enter unique card ID"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <Button
              onClick={handleCreateCard}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Create Card
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
