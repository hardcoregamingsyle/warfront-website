import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Settings, Activity } from "lucide-react";
import { Link } from "react-router";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function Admin() {
  // Include token from useAuth for authenticated actions
  const { user, token } = useAuth();
  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();

  const isAuthorized =
    !!user &&
    (
      roleLc === "admin" ||
      roleLc === "owner" ||
      emailLc === "hardcorgamingstyle@gmail.com"
    );

  // Add: roles list for broadcasting notifications (must match backend roles)
  const ALL_ROLES = useMemo(
    () => [
      "UNVERIFIED",
      "VERIFIED",
      "INFLUENCER",
      "ADMIN",
      "OWNER",
      "CARD_SETTER",
      "BLOGGERS",
    ] as const,
    [],
  );

  const [selectedRoles, setSelectedRoles] = useState<Array<string>>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const broadcast = useMutation(api.notifications.adminBroadcastNotification);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSend = async () => {
    try {
      if (!token) {
        toast.error("You must be logged in.");
        return;
      }
      if (selectedRoles.length === 0) {
        toast.error("Select at least one role.");
        return;
      }
      if (!title.trim() || !message.trim()) {
        toast.error("Title and Message are required.");
        return;
      }
      setIsSending(true);
      const res = await broadcast({
        token: token ?? "",
        roles: selectedRoles as any,
        title: title.trim(),
        message: message.trim(),
      });
      toast.success(typeof res === "string" ? res : "Notification sent!");
      setTitle("");
      setMessage("");
      setSelectedRoles([]);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send notifications");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Admin | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
        <meta name="description" content="Administrative controls for Warfront." />
      </Helmet>

      {!isAuthorized ? (
        <div className="flex items-center justify-center h-full py-24">
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                You are not authorized to view this page.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto py-8 text-white">
          <h1 className="text-4xl font-bold text-red-400 mb-6">Admin Control Panel</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Card Info quick access */}
            <Card className="bg-slate-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  Card Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>Quick access to card-related admin information and tools.</p>
                <Link to="/admin/card-info">
                  <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                    Open Card Info
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Shield className="h-5 w-5" />
                  Moderation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>Review reports, manage user roles, and handle escalations.</p>
                <Link to="/admin/users">
                  <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                    Manage Users
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Users className="h-5 w-5" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>Search users, inspect profiles, and manage access.</p>
                <Link to="/admin/users">
                  <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                    Open Users
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Settings className="h-5 w-5" />
                  System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>Environment, maintenance tasks, and feature flags.</p>
                <Link to="/admin/cms">
                  <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                    Open CMS
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Activity className="h-5 w-5" />
                  Activity & Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>Recent actions, health metrics, and security logs.</p>
                <Link to="/all-cards">
                  <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                    Go to All Cards
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Send Notification Card */}
            <Card className="bg-slate-900/50 border-red-500/20 md:col-span-2 xl:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  Send Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-300">
                <div className="space-y-2">
                  <Label className="text-slate-200">Select Roles</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {ALL_ROLES.map((role) => (
                      <label
                        key={role}
                        className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-md px-3 py-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="accent-red-500 cursor-pointer"
                          checked={selectedRoles.includes(role)}
                          onChange={() => toggleRole(role)}
                        />
                        <span className="text-sm">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="broadcast-title" className="text-slate-200">Title</Label>
                  <Input
                    id="broadcast-title"
                    placeholder="Enter a concise title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-800/40 border-slate-700/60 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="broadcast-message" className="text-slate-200">Message</Label>
                  <Textarea
                    id="broadcast-message"
                    placeholder="Write the message to send to all selected roles"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-slate-800/40 border-slate-700/60 text-white placeholder:text-slate-400 min-h-32"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleSend}
                    disabled={isSending}
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}