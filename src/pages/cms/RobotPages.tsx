import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cmsStore } from "./cmsStore";
import { useEffect, useState } from "react";

export default function RobotPages() {
  const { user } = useAuth();
  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();
  const isAuthorized =
    !!user &&
    (roleLc === "admin" || roleLc === "owner" || emailLc === "hardcorgamingstyle@gmail.com");

  const [rows, setRows] = useState(cmsStore.getByCategory("robot"));

  useEffect(() => {
    const sync = () => setRows(cmsStore.getByCategory("robot"));
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
              <ul className="space-y-2">
                {rows.map((r) => (
                  <li key={r.path} className="text-white">
                    <span className="font-mono text-slate-300">{r.path}</span> — {r.title}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
