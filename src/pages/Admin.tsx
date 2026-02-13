import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Settings, Activity, Upload } from "lucide-react";
import { Link } from "react-router";

export default function Admin() {
  const { user } = useAuth();
  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();

  const isAuthorized =
    !!user &&
    (
      roleLc === "admin" ||
      roleLc === "owner" ||
      emailLc === "hardcorgamingstyle@gmail.com"
    );

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
            <Card className="bg-slate-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Shield className="h-5 w-5" />
                  Card Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>Add and manage cards in the system.</p>
                <div className="flex gap-2 flex-wrap">
                  <Link to="/admin/add-card">
                    <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                      Add Single Card
                    </Button>
                  </Link>
                  <Link to="/admin/bulk-add-cards">
                    <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Import
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>Manage users, roles, and permissions.</p>
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
                  <Settings className="h-5 w-5" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>Manage blogs, cards, and company content.</p>
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
                  All Cards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>View and manage all cards in the database.</p>
                <Link to="/all-cards">
                  <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                    View All Cards
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}