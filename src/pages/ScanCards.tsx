import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { QrCode, Layers, Camera, ArrowLeft } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { toast } from "sonner";

export default function ScanCards() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "single"; // 'single' or 'multi'
  const [isScanning, setIsScanning] = useState(true);
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        qrbox: { width: 250, height: 250 }, 
        fps: 5,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      false
    );
    
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        if (mode === "single") {
          scanner.clear();
          setIsScanning(false);
          toast.success("Card scanned successfully!");
          
          try {
            const url = new URL(decodedText);
            if (url.pathname.includes('/cards/')) {
               navigate(url.pathname + url.search + url.hash);
            } else {
               toast.info(`Scanned: ${decodedText}`);
            }
          } catch {
            if (decodedText.length > 5) {
               navigate(`/cards/${decodedText}`);
            } else {
               toast.info(`Scanned: ${decodedText}`);
            }
          }
        } else {
          setScannedCodes((prev) => {
            if (!prev.includes(decodedText)) {
              toast.success("Card added to batch!");
              return [...prev, decodedText];
            }
            return prev;
          });
        }
      },
      (error) => {
        // Ignore errors, they happen constantly when no QR code is in view
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [isScanning, mode, navigate]);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 max-w-md min-h-[80vh] flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {mode === "multi" ? "Scan Multiple Cards" : "Scan Card"}
          </h1>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {/* Camera Viewfinder */}
          <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl min-h-[300px]">
            {isScanning ? (
              <div id="reader" className="w-full h-full [&>div]:border-none [&_video]:object-cover [&_video]:h-full [&_video]:w-full" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
                <Camera className="h-12 w-12 opacity-50 mb-4" />
                <Button onClick={() => setIsScanning(true)}>Scan Again</Button>
              </div>
            )}
          </div>

          {mode === "multi" && scannedCodes.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-2">Scanned Cards ({scannedCodes.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {scannedCodes.map((code, i) => (
                    <div key={i} className="text-xs text-slate-300 bg-slate-800 p-2 rounded truncate">
                      {code}
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white">
                  Process Batch
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/scan?mode=single" className="w-full" onClick={() => { setScannedCodes([]); setIsScanning(true); }}>
              <Button 
                variant={mode === "single" ? "default" : "outline"}
                className={`w-full h-14 ${mode === "single" ? "bg-red-600 hover:bg-red-700" : "border-slate-700 text-slate-300"}`}
              >
                <QrCode className="mr-2 h-5 w-5" />
                Single
              </Button>
            </Link>
            <Link to="/scan?mode=multi" className="w-full" onClick={() => { setScannedCodes([]); setIsScanning(true); }}>
              <Button 
                variant={mode === "multi" ? "default" : "outline"}
                className={`w-full h-14 ${mode === "multi" ? "bg-red-600 hover:bg-red-700" : "border-slate-700 text-slate-300"}`}
              >
                <Layers className="mr-2 h-5 w-5" />
                Multiple
              </Button>
            </Link>
          </div>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400 text-center">
                Camera access is required to scan physical cards. 
                <br />
                Ensure you have granted permissions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
