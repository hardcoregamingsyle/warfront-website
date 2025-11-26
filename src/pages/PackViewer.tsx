import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function PackViewer() {
  const { packId } = useParams<{ packId: string }>();
  const [searchParams] = useSearchParams();
  const method = searchParams.get("method");
  
  const scanMutation = useMutation(api.packs.scan);
  const packQuery = useQuery(api.packs.get, packId ? { packId } : "skip");
  
  const [scanResult, setScanResult] = useState<any>(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    if (packId && method === "mnhsgwbwyqosu" && !scannedRef.current) {
      scannedRef.current = true;
      scanMutation({ packId })
        .then((res) => {
            setScanResult(res);
        })
        .catch((err) => {
            console.error("Scan failed", err);
        });
    }
  }, [packId, method, scanMutation]);

  // Use scanResult if available (it's the most recent state after mutation), otherwise query result
  const pack = scanResult !== null ? scanResult : packQuery;
  
  // Loading if query is loading AND we haven't got a scan result yet
  // If scanResult is null (meaning scan failed or didn't happen yet or pack not found via scan), check query
  // If query is undefined, it's loading.
  const isLoading = packQuery === undefined && scanResult === null;

  return (
    <DashboardLayout>
      <Helmet>
        <title>Pack Verification | Warfront</title>
      </Helmet>
      <div className="container mx-auto py-12 flex flex-col items-center justify-center min-h-[60vh]">
        {isLoading ? (
           <Loader2 className="h-12 w-12 animate-spin text-red-500" />
        ) : !pack ? (
           <Card className="max-w-md w-full bg-slate-900 border-red-500/50">
             <CardHeader>
               <CardTitle className="text-red-500 flex items-center gap-2">
                 <ShieldAlert className="h-6 w-6" />
                 Invalid Pack
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-slate-300">
                 This pack ID <span className="font-mono text-white bg-slate-800 px-1 rounded">{packId}</span> is not recognized in our database. 
               </p>
               <p className="text-red-400 mt-4 font-semibold">
                 It may be a counterfeit product.
               </p>
             </CardContent>
           </Card>
        ) : (
           <Card className="max-w-md w-full bg-slate-900 border-slate-700">
             <CardHeader>
               <CardTitle className="text-white flex items-center gap-2">
                 Pack Verification
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-8">
               <div className="text-center space-y-2">
                 <p className="text-slate-400 text-xs uppercase tracking-widest">Pack Number</p>
                 <p className="text-2xl font-mono text-white break-all">{pack.packId}</p>
               </div>

               <div className="text-center space-y-2">
                 <p className="text-slate-400 text-xs uppercase tracking-widest">Times Scanned</p>
                 <p className="text-5xl font-bold text-white">{pack.scanCount}</p>
               </div>

               {pack.scanCount <= 1 ? (
                 <Alert className="bg-green-900/20 border-green-500/50">
                   <ShieldCheck className="h-5 w-5 text-green-400" />
                   <AlertTitle className="text-green-400">Authentic Pack</AlertTitle>
                   <AlertDescription className="text-green-200 mt-2">
                     Yes, The Pack is Real. This is the first time it has been scanned.
                   </AlertDescription>
                 </Alert>
               ) : (
                 <Alert className="bg-red-900/20 border-red-500/50">
                   <AlertTriangle className="h-5 w-5 text-red-400" />
                   <AlertTitle className="text-red-400">Warning: Potential Risk</AlertTitle>
                   <AlertDescription className="text-red-200 mt-2">
                     This pack has been scanned <strong>{pack.scanCount}</strong> times. 
                     <br/><br/>
                     If you are opening this pack for the first time, <strong>your cards may be Fake</strong> or the pack may have been resealed.
                   </AlertDescription>
                 </Alert>
               )}
             </CardContent>
           </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
