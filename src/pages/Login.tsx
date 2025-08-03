import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAction } from "convex/react";
import { Lock, Loader2, User, Mail } from "lucide-react";
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
  const loginAction = useAction(api.users.loginAction);
  const { signIn } = useAuthActions();

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const handleCredentialSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginData = {
        identifier: data.identifier.toLowerCase(),
        password: data.password,
      };
      const result = await loginAction(loginData);
      
      const signInData = new FormData();
      signInData.append("email", result.email);
      await signIn("email-otp", signInData);

      setEmail(result.email);
      setStep("otp");
      toast.success("Password verified! Check your email for a login code.");
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const signInData = new FormData();
      signInData.append("email", email);
      signInData.append("code", otp);
      await signIn("email-otp", signInData);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white">
        {step === "credentials" ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-red-500">
                Warfront Login
              </CardTitle>
              <CardDescription className="text-slate-400">
                Enter your credentials to access the battlefield.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleCredentialSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Username or Email</Label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="identifier"
                      placeholder="your_username or name@email.com"
                      className="pl-10 bg-slate-900/50 border-slate-600 focus:ring-red-500"
                      {...form.register("identifier")}
                    />
                  </div>
                  {form.formState.errors.identifier && (
                    <p className="text-red-500 text-sm">{form.formState.errors.identifier.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-slate-900/50 border-slate-600 focus:ring-red-500"
                      {...form.register("password")}
                    />
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
                  )}
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Credentials"
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-slate-400">
                <p>
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-red-500 hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-red-500">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-slate-400">
                We've sent a login code to {email}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      id="otp"
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging In...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-slate-400">
                <p>
                  Entered the wrong password?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-red-500"
                    onClick={() => setStep("credentials")}
                  >
                    Try again
                  </Button>
                </p>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}