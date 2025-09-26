import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Local CMS types to match backend
type CmsCategory = "unsorted" | "public" | "private" | "cards" | "robot";
type CmsPage = { path: string; title: string; category: CmsCategory };
import { motion } from "framer-motion";

type RowDraft = {
  path: string;
  nextCategory: CmsCategory | "";
};

export default function PagesUnsorted() {
  const { user } = useAuth();
  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();
  const isAuthorized =
    !!user &&
    (roleLc === "admin" || roleLc === "owner" || emailLc === "hardcorgamingstyle@gmail.com");

  const rows = useQuery(api.cms.getByCategory, { category: "unsorted" }) ?? [];
  const moveMutation = useMutation(api.cms.move);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});

  useEffect(() => {
    const next: Record<string, RowDraft> = {};
    for (const r of rows ?? []) {
      next[r.path] = drafts[r.path] ?? { path: r.path, nextCategory: "" };
    }
    setDrafts(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows?.length]);

  const categories: Array<{ label: string; value: CmsCategory }> = useMemo(
    () => [
      { label: "Public Pages", value: "public" },
      { label: "Private Pages", value: "private" },
      { label: "Card Pages", value: "cards" },
      { label: "Robot Pages", value: "robot" },
    ],
    [],
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

  const onSave = async (path: string) => {
    const draft = drafts[path];
    if (!draft || !draft.nextCategory) {
      toast("Please select a category first.");
      return;
    }
    await moveMutation({ path, to: draft.nextCategory });
    toast(`Moved ${path} to ${draft.nextCategory.toUpperCase()} successfully.`);
    // Clear draft selection for that row
    setDrafts((prev) => ({ ...prev, [path]: { path, nextCategory: "" } }));
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Admin • Unsorted Pages | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
      </Helmet>

      <div className="container mx-auto py-8 text-white">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-red-400">Unsorted Pages</h1>
          <p className="text-slate-300 mt-1">
            Classify any page into Public, Private, Card, or Robot. Changes apply instantly across tabs.
          </p>
        </div>

        <Card className="bg-slate-900/50 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">All Unsorted Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-300">Path</TableHead>
                    <TableHead className="text-slate-300">Title</TableHead>
                    <TableHead className="text-slate-300">Current</TableHead>
                    <TableHead className="text-slate-300">Change To</TableHead>
                    <TableHead className="text-slate-300 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400 py-6">
                        Nothing to classify. Great work!
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, index) => (
                      <motion.tr
                        key={r.path}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                        className="border-b border-slate-800"
                      >
                        <TableCell className="font-mono text-sm">{r.path}</TableCell>
                        <TableCell>{r.title}</TableCell>
                        <TableCell className="uppercase text-slate-400">{r.category}</TableCell>
                        <TableCell>
                          <Select
                            value={drafts[r.path]?.nextCategory || ""}
                            onValueChange={(v) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [r.path]: {
                                  path: r.path,
                                  nextCategory: v as CmsCategory,
                                },
                              }))
                            }
                          >
                            <SelectTrigger className="w-56 bg-slate-800 border-slate-700 text-white">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                              {/* Provide non-empty values per shadcn requirement */}
                              <SelectItem value="public">Public Pages</SelectItem>
                              <SelectItem value="private">Private Pages</SelectItem>
                              <SelectItem value="cards">Card Pages</SelectItem>
                              <SelectItem value="robot">Robot Pages</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => onSave(r.path)}
                          >
                            Save
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
