import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailVerified() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const verifyEmail = useMutation(api.users.verifyUserEmail);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (verificationAttempted.current) {
      return;
    }
    verificationAttempted.current = true;

    const token = new URLSearchParams(location.search).get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please check your link.");
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyEmail({ token });
        setStatus("success");
        setMessage(result);
        toast.success("Email verified! You can now log in.");
        setTimeout(() => navigate("/login"), 3000);
      } catch (error: any) {
        setStatus("error");
        const errorMessage =
          error.data?.data ||
          "Verification failed. The link may be invalid or expired.";
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verify();
  }, [location, navigate, verifyEmail]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-red-400" />
            <p className="text-slate-300">Verifying your email...</p>
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <ShieldCheck className="h-12 w-12 text-green-500" />
            <p className="text-slate-300">{message}</p>
            <p className="text-sm text-slate-400">
              Redirecting you to the login page...
            </p>
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <ShieldX className="h-12 w-12 text-red-500" />
            <p className="text-slate-300">{message}</p>
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-center text-red-400">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}