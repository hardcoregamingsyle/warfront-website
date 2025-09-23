import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Settings, Activity } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const isAuthorized =
    !!user &&
    (
      user.role === "Admin" ||
      user.role === "Owner" ||
      user.email_normalized === "hardcorgamingstyle@gmail.com"
    );

  if (!isAuthorized) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Admin | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta name="description" content="Administrative controls for Warfront." />
      </Helmet>

      <div className="container mx-auto py-8 text-white">
        <h1 className="text-4xl font-bold text-red-400 mb-6">Admin Control Panel</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Shield className="h-5 w-5" />
                Moderation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-slate-300">
              <p>Review reports, manage user roles, and handle escalations.</p>
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                Open Moderation
              </Button>
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
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                Manage Users
              </Button>
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
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                System Settings
              </Button>
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
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                View Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}