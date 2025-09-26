import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { cmsStore, CmsCategory, CmsPage } from "./cmsStore";
import { useEffect, useState } from "react";

export default function RobotPages() {
  const { user } = useAuth();
  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();
  const isAuthorized =
    !!user &&
    (roleLc === "admin" || roleLc === "owner" || emailLc === "hardcorgamingstyle@gmail.com");

  const [rows, setRows] = useState(cmsStore.getByCategory("robot"));
  const [drafts, setDrafts] = useState<Record<string, { path: string; nextCategory: CmsCategory | "" }>>({});

  useEffect(() => {
    const sync = () => {
      const data = cmsStore.getByCategory("robot");
      setRows(data);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const r of data) {
          if (!next[r.path]) next[r.path] = { path: r.path, nextCategory: "" };
        }
        return next;
      });
    };
    const unsub = cmsStore.subscribe(sync);
    sync();
    return () => { unsub(); };
  }, []);

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

  const onSave = (path: string) => {
    const draft = drafts[path];
    if (!draft || !draft.nextCategory) {
      toast("Please select a category first.");
      return;
    }
    cmsStore.move(path, draft.nextCategory);
    toast(`Moved ${path} to ${draft.nextCategory.toUpperCase()} successfully.`);
    setDrafts((prev) => ({ ...prev, [path]: { path, nextCategory: "" } }));
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Admin • Robot Pages | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
      </Helmet>

      <div className="container mx-auto py-8 text-white">
        <h1 className="text-3xl font-bold text-red-400 mb-6">Robot Pages</h1>
        <Card className="bg-slate-900/50 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-slate-400">No pages assigned to this category yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-300">Path</TableHead>
                      <TableHead className="text-slate-300">Title</TableHead>
                      <TableHead className="text-slate-300">Change To</TableHead>
                      <TableHead className="text-slate-300 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.path} className="border-b border-slate-800">
                        <TableCell className="font-mono text-sm">{r.path}</TableCell>
                        <TableCell>{r.title}</TableCell>
                        <TableCell>
                          <Select
                            value={drafts[r.path]?.nextCategory || ""}
                            onValueChange={(v) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [r.path]: { path: r.path, nextCategory: v as CmsCategory },
                              }))
                            }
                          >
                            <SelectTrigger className="w-56 bg-slate-800 border-slate-700 text-white">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                              <SelectItem value="public">Public Pages</SelectItem>
                              <SelectItem value="private">Private Pages</SelectItem>
                              <SelectItem value="cards">Card Pages</SelectItem>
                              <SelectItem value="robot">Robot Pages</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button className="bg-red-600 hover:bg-red-700" onClick={() => onSave(r.path)}>
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}