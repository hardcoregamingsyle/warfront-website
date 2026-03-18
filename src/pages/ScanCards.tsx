import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { QrCode, Layers, Camera, ArrowLeft } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import jsQR from "jsqr";

export default function ScanCards() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "single";
  const [isScanning, setIsScanning] = useState(true);
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [mirrored, setMirrored] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const mirrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // External scanner (USB/Bluetooth keyboard) buffer
  const externalBufferRef = useRef<string>("");
  const externalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const triggerMirrorFlash = useCallback(() => {
    if (mirrorTimeoutRef.current) clearTimeout(mirrorTimeoutRef.current);
    setMirrored(true);
    mirrorTimeoutRef.current = setTimeout(() => setMirrored(false), 600);
  }, []);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleQRCode = useCallback(
    (decodedText: string) => {
      const trimmed = decodedText.trim();
      if (!trimmed) return;

      // Debounce: ignore same code within 2 seconds
      if (lastScannedRef.current === trimmed) return;
      lastScannedRef.current = trimmed;
      setTimeout(() => { lastScannedRef.current = null; }, 2000);

      const isWarfrontCard = (() => {
        try {
          const url = new URL(trimmed);
          return url.pathname.includes("/cards/");
        } catch {
          // Not a URL — check if it looks like a card ID
          return /^[a-zA-Z0-9_-]{8,}$/.test(trimmed);
        }
      })();

      if (!isWarfrontCard) {
        triggerMirrorFlash();
        toast.error("Invalid card QR code");
        return;
      }

      if (mode === "single") {
        stopCamera();
        setIsScanning(false);
        toast.success("Card scanned successfully!");
        try {
          const url = new URL(trimmed);
          navigate(url.pathname + url.search + url.hash);
        } catch {
          navigate(`/cards/${trimmed}`);
        }
      } else {
        setScannedCodes((prev) => {
          if (!prev.includes(trimmed)) {
            toast.success("Card added to batch!");
            return [...prev, trimmed];
          }
          return prev;
        });
      }
    },
    [mode, navigate, stopCamera, triggerMirrorFlash]
  );

  // Handle external USB/Bluetooth QR scanner (acts as keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // External scanners type fast and end with Enter
      if (e.key === "Enter") {
        const buffer = externalBufferRef.current;
        externalBufferRef.current = "";
        if (externalTimerRef.current) clearTimeout(externalTimerRef.current);
        if (buffer.length > 5) {
          handleQRCode(buffer);
        }
        return;
      }

      // Only capture printable characters
      if (e.key.length === 1) {
        externalBufferRef.current += e.key;
        // Auto-flush if no Enter within 100ms (some scanners don't send Enter)
        if (externalTimerRef.current) clearTimeout(externalTimerRef.current);
        externalTimerRef.current = setTimeout(() => {
          const buffer = externalBufferRef.current;
          externalBufferRef.current = "";
          if (buffer.length > 5) {
            handleQRCode(buffer);
          }
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleQRCode]);

  const startScanning = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          if (code && code.data) {
            handleQRCode(code.data);
          }
        } catch {
          // Ignore decode errors
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [handleQRCode]);

  useEffect(() => {
    if (!isScanning) return;

    setCameraError(null);
    lastScannedRef.current = null;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      .then((stream) => {
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.setAttribute("playsinline", "true");
          video.play().then(() => startScanning()).catch(console.error);
        }
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setCameraError("Camera access denied or unavailable. You can still use an external QR scanner.");
      });

    return () => stopCamera();
  }, [isScanning, startScanning, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mirrorTimeoutRef.current) clearTimeout(mirrorTimeoutRef.current);
      if (externalTimerRef.current) clearTimeout(externalTimerRef.current);
    };
  }, []);

  const handleRescan = () => {
    setScannedCodes([]);
    setIsScanning(true);
  };

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
          <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl" style={{ minHeight: 300 }}>
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  style={{
                    transform: mirrored ? "scaleX(-1)" : "scaleX(1)",
                    transition: "transform 0.1s ease-in-out",
                    display: "block",
                    minHeight: 300,
                  }}
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Scan overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-52 border-2 border-white/60 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500 rounded-tl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500 rounded-br" />
                  </div>
                </div>
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white text-center p-4">
                    <Camera className="h-10 w-10 mb-3 opacity-50" />
                    <p className="text-sm text-slate-300">{cameraError}</p>
                    <p className="text-xs text-slate-400 mt-2">External QR scanner still works</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12" style={{ minHeight: 300 }}>
                <Camera className="h-12 w-12 opacity-50 mb-4" />
                <Button onClick={handleRescan}>Scan Again</Button>
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
                Point your camera at a Warfront card QR code,<br />
                or use an external QR scanner.<br />
                Invalid QR codes will flash a mirror effect.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}