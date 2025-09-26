import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft, Plus, Edit, Trash2, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function CompanyBlogs() {
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

  // Mock data - replace with actual database queries
  const companyBlogs = [
    {
      id: "1",
      title: "Warfront 2024 Roadmap",
      author: "CEO",
      status: "Published",
      createdAt: "2024-01-10",
      views: 3500
    },
    {
      id: "2",
      title: "New Tournament Format Announcement",
      author: "Admin",
      status: "Scheduled",
      createdAt: "2024-01-12",
      views: 0
    }
  ];

  return (
    <DashboardLayout>
      <Helmet>
        <title>Admin • Company Blogs | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
      </Helmet>
      
      <div className="container mx-auto py-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin/cms/blogs">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-red-400">Company Blogs</h1>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            New Company Blog
          </Button>
        </div>

        <Card className="bg-slate-900/50 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">All Company Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyBlogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No company blogs found</p>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Company Blog
                  </Button>
                </div>
              ) : (
                companyBlogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-slate-700 rounded-lg p-4 hover:border-red-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{blog.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>By {blog.author}</span>
                          <span>•</span>
                          <span>{blog.createdAt}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            blog.status === 'Published' 
                              ? 'bg-green-900/30 text-green-400' 
                              : blog.status === 'Scheduled'
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {blog.status}
                          </span>
                          <span>•</span>
                          <span>{blog.views} views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
