import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function EmailVerified() {
  const location = useLocation();
  const verifyEmail = useMutation(api.users.verifyUserEmail);
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");

    if (token) {
      verifyEmail({ token })
        .then(() => {
          setStatus("success");
          toast.success("Email verified successfully!");
        })
        .catch((err) => {
          setStatus("error");
          const message = err.data?.data || "An unknown error occurred.";
          setErrorMessage(message);
          toast.error(message);
        });
    } else {
      setStatus("error");
      setErrorMessage("No verification token found in URL.");
    }
  }, [location, verifyEmail]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <Helmet>
        <title>Verifying Email - Warfront</title>
      </Helmet>
      
      {status === "verifying" && (
        <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-center">
          <CardHeader>
            <div className="mx-auto bg-slate-700 rounded-full p-3 w-fit">
              <Loader2 className="h-12 w-12 text-slate-400 animate-spin" />
            </div>
            <CardTitle className="text-slate-300 mt-4">
              Verifying your email...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">Please wait a moment.</p>
          </CardContent>
        </Card>
      )}

      {status === "success" && (
        <Card className="w-full max-w-md bg-slate-800 border-green-500/20 text-center">
          <CardHeader>
            <div className="mx-auto bg-green-500/10 rounded-full p-3 w-fit">
              <CheckCircle2 className="h-12 w-12 text-green-400" />
            </div>
            <CardTitle className="text-green-400 mt-4">
              Email Verified Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              Thank you for verifying your email. Your account is now active. You
              can now log in to access your dashboard and join the battle.
            </p>
            <Button asChild className="w-full bg-red-600 hover:bg-red-700">
              <Link to="/login">Proceed to Login</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "error" && (
        <Card className="w-full max-w-md bg-slate-800 border-red-500/20 text-center">
          <CardHeader>
            <div className="mx-auto bg-red-500/10 rounded-full p-3 w-fit">
              <AlertTriangle className="h-12 w-12 text-red-400" />
            </div>
            <CardTitle className="text-red-400 mt-4">
              Verification Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              {errorMessage}
            </p>
            <Button asChild className="w-full bg-red-600 hover:bg-red-700">
              <Link to="/signup">Return to Signup</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}