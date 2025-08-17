import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AccountSettings() {
  const { token } = useAuth();
  const userSettings = useQuery(api.users.getCurrentUserSettings, token ? { token } : "skip");
  const updateSettings = useMutation(api.users.updateAccountSettings);
  
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [region, setRegion] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Update form when user data loads
  useState(() => {
    if (userSettings) {
      setUsername(userSettings.name || "");
      setDisplayName(userSettings.displayName || "");
      setRegion(userSettings.region || "");
    }
  });

  const handleSave = async () => {
    if (!password) {
      toast.error("Please enter your password to confirm changes");
      return;
    }

    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    setLoading(true);
    try {
      await updateSettings({
        token,
        username: username || undefined,
        displayName: displayName || undefined,
        region: region || undefined,
        password,
      });
      toast.success("Account settings updated successfully");
      setPassword(""); // Clear password field
    } catch (error: any) {
      toast.error(error.data || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  if (userSettings === undefined) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-red-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Account Settings - Warfront</title>
      </Helmet>
      <div className="bg-black min-h-screen -m-10 p-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-red-400 mb-8">Account Settings</h1>
          
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-slate-300">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Optional display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region" className="text-slate-300">Region</Label>
                <Input
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="e.g., North America, Europe, Asia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Confirm Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Enter your password to save changes"
                />
              </div>

              <Button 
                onClick={handleSave}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}