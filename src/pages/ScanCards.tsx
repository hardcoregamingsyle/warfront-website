import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { QrCode, Layers, Camera, ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ScanCards() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "single"; // 'single' or 'multi'
  const [isScanning, setIsScanning] = useState(true);

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
          {/* Mock Camera Viewfinder */}
          <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl">
            {isScanning ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-red-500/50 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500" />
                    
                    {/* Scanning Line Animation */}
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <p className="text-white/80 text-sm font-medium bg-black/50 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
                    Align QR code within frame
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <Camera className="h-12 w-12 opacity-50" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/scan?mode=single" className="w-full">
              <Button 
                variant={mode === "single" ? "default" : "outline"}
                className={`w-full h-14 ${mode === "single" ? "bg-red-600 hover:bg-red-700" : "border-slate-700 text-slate-300"}`}
              >
                <QrCode className="mr-2 h-5 w-5" />
                Single
              </Button>
            </Link>
            <Link to="/scan?mode=multi" className="w-full">
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
