import DashboardLayout from "@/layouts/DashboardLayout";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Database as DatabaseIcon, Loader2 } from "lucide-react";

export default function AdminDatabase() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();

  const isAuthorized =
    !!user &&
    (
      roleLc === "admin" ||
      roleLc === "owner" ||
      emailLc === "hardcorgamingstyle@gmail.com"
    );

  useEffect(() => {
    if (!isAuthorized) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setLoading(false);
      const deploymentUrl = import.meta.env.VITE_CONVEX_URL;
      // Try to get deployment name from env or parse from URL
      let deploymentName = import.meta.env.VITE_CONVEX_DEPLOYMENT_NAME;
      
      if (!deploymentName && deploymentUrl) {
        try {
            // Extract subdomain from https://subdomain.convex.cloud
            const url = new URL(deploymentUrl);
            const parts = url.hostname.split('.');
            if (parts.length >= 3) {
                deploymentName = parts[0];
            }
        } catch (e) {
            console.error("Failed to parse deployment name from URL");
        }
      }
      
      const adminKey = import.meta.env.VITE_CONVEX_ADMIN_KEY;

      if (!deploymentUrl || !deploymentName || !adminKey) {
        setError("Missing configuration. Please set VITE_CONVEX_ADMIN_KEY in your environment variables. VITE_CONVEX_URL is also required.");
        return;
      }

      iframe.contentWindow?.postMessage({
        type: "setCredentials",
        deploymentUrl,
        deploymentName,
        adminKey,
        visiblePages: ["data", "functions", "logs", "health", "files", "schedules", "history", "settings"]
      }, "https://dashboard-embedded.convex.dev");
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [isAuthorized]);

  return (
    <DashboardLayout>
      <Helmet>
        <title>Database Admin | Warfront</title>
      </Helmet>

      {!isAuthorized ? (
        <div className="flex items-center justify-center h-full py-24">
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                You are not authorized to view this page.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto py-4 h-[calc(100vh-100px)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-red-400 flex items-center gap-2">
              <DatabaseIcon className="h-6 w-6" />
              Convex Database
            </h1>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900/50 text-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex-1 bg-white rounded-lg overflow-hidden relative border border-slate-700">
             {loading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                </div>
             )}
            <iframe
              ref={iframeRef}
              id="convex-dashboard"
              src="https://dashboard-embedded.convex.dev"
              className="w-full h-full border-0"
              title="Convex Dashboard"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Powered by Convex Embedded Dashboard. Ensure VITE_CONVEX_ADMIN_KEY is set in your environment variables.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
