import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { FileText, Image, Building } from "lucide-react";

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
        <title>CMS | Warfront Admin</title>
      </Helmet>

      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-red-400 mb-6">Content Management System</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <FileText className="h-5 w-5" />
                Blog Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-slate-300">Create and manage blog posts</p>
              <Link to="/admin/cms/add-blog">
                <Button variant="outline" className="w-full border-red-500 text-red-400 hover:bg-red-500/10">
                  Add Blog Post
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Image className="h-5 w-5" />
                Card Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-slate-300">Manage card-related content</p>
              <Link to="/admin/cms/add-blog/card">
                <Button variant="outline" className="w-full border-red-500 text-red-400 hover:bg-red-500/10">
                  Add Card Content
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Building className="h-5 w-5" />
                Company Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-slate-300">Manage company information</p>
              <Link to="/admin/cms/add-blog/company">
                <Button variant="outline" className="w-full border-red-500 text-red-400 hover:bg-red-500/10">
                  Add Company Content
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
