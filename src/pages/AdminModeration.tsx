import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminModeration() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Admin • Moderation | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
      </Helmet>

      <div className="container mx-auto py-8 text-white">
        <h1 className="text-3xl font-bold text-red-400 mb-6">Moderation</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400">Reports Queue</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              No reports in the queue. This section will show incoming user/content reports.
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400">Recent Actions</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Recent moderation actions will appear here for auditing purposes.
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
