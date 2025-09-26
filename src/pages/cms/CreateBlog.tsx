import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { cmsStore } from "./cmsStore";
import { useNavigate, Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function CreateBlog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();
  const isAuthorized =
    !!user &&
    (roleLc === "admin" || roleLc === "owner" || emailLc === "hardcorgamingstyle@gmail.com");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const normalizedSlug = useMemo(() => {
    // Normalize to lowercase slug with only [a-z0-9-]
    const s = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\-_\s]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    return s;
  }, [slug]);

  const fullPath = useMemo(() => {
    // Per request, blogs live under /blogs/cards/{slug}
    return `/blogs/cards/${normalizedSlug || ""}`;
  }, [normalizedSlug]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const finalTitle = title.trim();
      const finalSlug = normalizedSlug;

      if (!finalTitle) {
        toast("Please enter a blog title.");
        return;
      }
      if (!finalSlug) {
        toast("Please enter a valid blog address segment (slug).");
        return;
      }
      const path = `/blogs/cards/${finalSlug}`;
      // Register in CMS as "unsorted" so it can be classified
      cmsStore.ensure(path, finalTitle);

      toast(`Created blog "${finalTitle}" at ${path}. Assign it to a category.`);
      navigate("/admin/cms/pages/unsorted");
    },
    [title, normalizedSlug, navigate]
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
        <title>Admin • Create Blog | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
      </Helmet>

      <div className="container mx-auto py-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/cms/blogs/card-blogs">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Card Blogs
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-red-400">Create New Card Blog</h1>
        </div>

        <Card className="bg-slate-900/50 border-red-500/20 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-red-400">Blog Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-200">Name / Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced Strategies for Tank Cards"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-slate-200">Blog Address Segment</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. tank-card-strategy"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
                <p className="text-sm text-slate-400">
                  The blog will be created at: <span className="font-mono text-slate-200">{fullPath || "/blogs/cards/…"}</span>
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => navigate("/admin/cms/blogs/card-blogs")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Create Blog
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
