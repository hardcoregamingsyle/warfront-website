import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-red-500">Login Disabled</CardTitle>
          <CardDescription className="text-slate-400">
            Password login is temporarily disabled while we resolve an issue. Please sign up to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/signup" className="text-red-500 hover:underline">
            Go to Sign Up
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}