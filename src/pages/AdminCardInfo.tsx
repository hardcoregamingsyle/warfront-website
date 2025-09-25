import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function AdminCardInfo() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Card Info | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
        <meta name="description" content="Administrative card information and quick actions." />
      </Helmet>

      <div className="container mx-auto py-8 text-white">
        <h1 className="text-4xl font-bold text-red-400 mb-6">Card Info</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-slate-300">
              <p>
                View and manage the card database. Use quick actions below to jump to
                the full cards listing.
              </p>
              <Link to="/all-cards">
                <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                  Open All Cards
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400">Admin Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-slate-300">
              <p>
                Use the All Cards page to review, search, and remove cards (if authorized).
              </p>
              <div className="flex gap-3">
                <Link to="/admin">
                  <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                    Back to Admin
                  </Button>
                </Link>
                <Link to="/all-cards">
                  <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                    Manage Cards
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
