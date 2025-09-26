import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router";
import { 
  FileText, 
  Globe, 
  Lock, 
  Archive, 
  CreditCard,
  BookOpen,
  Building2,
  ChevronRight,
  ArrowLeft,
  Bot
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminCMS() {
  const { user } = useAuth();
  const location = useLocation();
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

  const cmsOptions = [
    {
      title: "Blogs",
      description: "Manage blog content and categories",
      icon: BookOpen,
      path: "/admin/cms/blogs",
      subOptions: [
        { name: "Card Blogs", path: "/admin/cms/blogs/card-blogs" },
        { name: "Company Blogs", path: "/admin/cms/blogs/company-blogs" }
      ]
    },
    {
      title: "Pages",
      description: "Manage website pages and content",
      icon: FileText,
      path: "/admin/cms/pages",
      subOptions: [
        { name: "Public Pages", path: "/admin/cms/pages/public" },
        { name: "Private Pages", path: "/admin/cms/pages/private" },
        { name: "Unsorted Pages", path: "/admin/cms/pages/unsorted" },
        { name: "Card Pages", path: "/admin/cms/pages/cards" },
        { name: "Robot Pages", path: "/admin/cms/robot" }
      ]
    }
  ];

  return (
    <DashboardLayout>
      <Helmet>
        <title>Admin • CMS | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
      </Helmet>
      
      <div className="container mx-auto py-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-red-400">Content Management System</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cmsOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-400/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-3">
                    <option.icon className="h-6 w-6" />
                    {option.title}
                  </CardTitle>
                  <p className="text-slate-300 text-sm">{option.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {option.subOptions.map((subOption) => (
                    <Link key={subOption.path} to={subOption.path}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between text-slate-300 hover:text-white hover:bg-slate-800/50"
                      >
                        <span className="flex items-center gap-2">
                          {subOption.name === "Public Pages" && <Globe className="h-4 w-4" />}
                          {subOption.name === "Private Pages" && <Lock className="h-4 w-4" />}
                          {subOption.name === "Unsorted Pages" && <Archive className="h-4 w-4" />}
                          {subOption.name === "Card Pages" && <CreditCard className="h-4 w-4" />}
                          {subOption.name === "Card Blogs" && <CreditCard className="h-4 w-4" />}
                          {subOption.name === "Company Blogs" && <Building2 className="h-4 w-4" />}
                          {subOption.name === "Robot Pages" && <Bot className="h-4 w-4" />}
                          {subOption.name}
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ))}
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
            <Link to="/admin/cms/blogs/card-blogs">
              <Button className="bg-red-600 hover:bg-red-700">
                <BookOpen className="h-4 w-4 mr-2" />
                New Card Blog
              </Button>
            </Link>
            <Link to="/admin/cms/pages/public">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <Globe className="h-4 w-4 mr-2" />
                Manage Public Pages
              </Button>
            </Link>
            <Link to="/admin/cms/pages/cards">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <CreditCard className="h-4 w-4 mr-2" />
                Card Content
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}