import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCMS() {
  const { user } = useAuth();
  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();
  const isAuthorized =
    !!user &&
    (roleLc === "admin" || roleLc === "owner" || emailLc === "hardcorgamingstyle@gmail.com");

  if (!isAuthorized) {
    return (
      <DashboardLayout>
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
        <title>Admin • CMS | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
      </Helmet>
      <div className="container mx-auto py-8 text-white">
        <h1 className="text-3xl font-bold text-red-400 mb-6">Admin CMS</h1>
        <Card className="bg-slate-900/50 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">Content Management</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            More subpages coming soon.
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
