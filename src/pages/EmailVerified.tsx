import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function EmailVerified() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <Helmet>
            <title>Email Verified - Warfront</title>
        </Helmet>
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
    </div>
  );
}