import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "convex/react";
import { Lock, Loader2, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  identifier: z.string().min(1, "Username or email is required."),
  password: z.string().min(1, "Password is required."),
});

type FormData = z.infer<typeof formSchema>;

export default function Login() {
  const navigate = useNavigate();
  const login = useAction(api.users.loginAction);
  const { signIn } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const handleLogin = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Verify credentials with backend
      await login(data);
      
      // Create session using the email from the verified user
      const email = data.identifier.includes("@") ? data.identifier : "";
      if (email) {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("code", "verified"); // Special code to indicate pre-verified
        await signIn("email-otp", formData);
      }
      
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Link to="/">
          <img
            src="/assets/Untitled_design.png"
            alt="Warfront Logo"
            className="h-12 w-auto"
          />
        </Link>
      </div>
      <Card className="w-full max-w-md bg-slate-900/50 border-slate-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl tracking-tight">
            Welcome Back, Commander
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enter your credentials to access the battlefield.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="identifier"
                  {...form.register("identifier")}
                  placeholder="username or email@example.com"
                  className="pl-9 bg-slate-800 border-slate-600 focus:ring-red-500"
                />
              </div>
              {form.formState.errors.identifier && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.identifier.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  {...form.register("password")}
                  type="password"
                  placeholder="********"
                  className="pl-9 bg-slate-800 border-slate-600 focus:ring-red-500"
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-slate-400 mt-4">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="underline underline-offset-4 hover:text-red-500"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}