import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft, CreditCard, Building2, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogsMain() {
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

  const blogCategories = [
    {
      title: "Card Blogs",
      description: "Blogs about specific cards, strategies, and gameplay",
      icon: CreditCard,
      path: "/admin/cms/blogs/card-blogs",
      count: 0 // TODO: Get actual count from database
    },
    {
      title: "Company Blogs",
      description: "Company news, updates, and announcements",
      icon: Building2,
      path: "/admin/cms/blogs/company-blogs",
      count: 0 // TODO: Get actual count from database
    }
  ];

  return (
    <DashboardLayout>
      <Helmet>
        <title>Admin • Blogs | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
      </Helmet>
      
      <div className="container mx-auto py-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/cms">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to CMS
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-red-400">Blog Management</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-400/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-3">
                    <category.icon className="h-6 w-6" />
                    {category.title}
                  </CardTitle>
                  <p className="text-slate-300 text-sm">{category.description}</p>
                  <p className="text-slate-400 text-xs">{category.count} posts</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to={category.path}>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Manage {category.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="bg-slate-900/50 border-red-500/20 mt-8">
          <CardHeader>
            <CardTitle className="text-red-400">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Blog Post
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              View All Drafts
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Scheduled Posts
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
