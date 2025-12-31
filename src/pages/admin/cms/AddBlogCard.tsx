import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAddBlogCard() {
  const { user } = useAuth();
  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();
  const isAuthorized =
    !!user &&
    (roleLc === "admin" || roleLc === "owner" || emailLc === "hardcorgamingstyle@gmail.com");

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
        <title>Add Card Content | Warfront Admin</title>
      </Helmet>

      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-red-400 mb-6">Add Card Content</h1>
        <Card className="bg-slate-900/50 border-red-500/20">
          <CardContent className="pt-6">
            <p className="text-slate-300">Card content creation form coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
