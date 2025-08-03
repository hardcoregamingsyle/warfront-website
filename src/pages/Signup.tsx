import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, User, Calendar, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useMutation, useConvex, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

const formSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters."),
    email: z.string().email("Invalid email address."),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Please select a gender.",
    }),
    dob: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
      message: "Please enter your date of birth.",
    }),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const convex = useConvex();
  const signup = useAction(api.users.signupAction);
  const verifyOtp = useMutation(api.users.verifyOtp);

  const [step, setStep] = useState<"details" | "otp">("details");
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const handleDetailsSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check availability first
      const availability = await convex.query(api.users.checkAvailability, {
        username: data.username,
        email: data.email,
      });

      if (!availability.available) {
        setError(availability.message || "Username or email is not available.");
        setIsLoading(false);
        return;
      }

      // Call signup action
      const newUserId = await signup(data);
      setUserId(newUserId);
      setEmail(data.email);
      setStep("otp");
      toast.success("Verification code sent to your email!");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyOtp({ userId, otp });
      if (result.success) {
        toast.success("Account verified! Please log in to continue.");
        navigate("/login");
      } else {
        setError("An unknown error occurred.");
      }
    } catch (error) {
      setError("The verification code you entered is incorrect.");
      setOtp("");
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
        {step === "details" ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl tracking-tight">
                Create an Account
              </CardTitle>
              <CardDescription className="text-slate-400">
                Join the battle and create your commander profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(handleDetailsSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="username"
                      {...form.register("username")}
                      placeholder="Your callsign"
                      className="pl-9 bg-slate-800 border-slate-600 focus:ring-red-500"
                    />
                  </div>
                  {form.formState.errors.username && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      {...form.register("email")}
                      placeholder="name@example.com"
                      type="email"
                      className="pl-9 bg-slate-800 border-slate-600 focus:ring-red-500"
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={
                        form.watch("gender") === "male"
                          ? "destructive"
                          : "outline"
                      }
                      onClick={() =>
                        form.setValue("gender", "male", {
                          shouldValidate: true,
                        })
                      }
                      className="flex-1"
                    >
                      Male
                    </Button>
                    <Button
                      type="button"
                      variant={
                        form.watch("gender") === "female"
                          ? "destructive"
                          : "outline"
                      }
                      onClick={() =>
                        form.setValue("gender", "female", {
                          shouldValidate: true,
                        })
                      }
                      className="flex-1"
                    >
                      Female
                    </Button>
                    <Button
                      type="button"
                      variant={
                        form.watch("gender") === "other"
                          ? "destructive"
                          : "outline"
                      }
                      onClick={() =>
                        form.setValue("gender", "other", {
                          shouldValidate: true,
                        })
                      }
                      className="flex-1"
                    >
                      Other
                    </Button>
                  </div>
                  {form.formState.errors.gender && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.gender.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="dob"
                      {...form.register("dob")}
                      type="date"
                      className="pl-9 bg-slate-800 border-slate-600 focus:ring-red-500"
                    />
                  </div>
                  {form.formState.errors.dob && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.dob.message}
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      {...form.register("confirmPassword")}
                      type="password"
                      placeholder="********"
                      className="pl-9 bg-slate-800 border-slate-600 focus:ring-red-500"
                    />
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.confirmPassword.message}
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
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl tracking-tight">
                Check your email
              </CardTitle>
              <CardDescription className="text-slate-400">
                We've sent a code to {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpSubmit}>
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="text-white bg-slate-800 border-slate-600"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && (
                  <p className="mt-4 text-sm text-red-500 text-center">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full mt-6 bg-red-600 hover:bg-red-700"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Verify and Create Account"
                  )}
                </Button>
              </form>
              <p className="text-sm text-slate-400 text-center mt-4">
                Didn't receive a code?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-red-500"
                  onClick={() => setStep("details")}
                >
                  Try again
                </Button>
              </p>
            </CardContent>
          </>
        )}
      </Card>
      <p className="text-center text-sm text-slate-400 mt-4">
        Already have an account?{" "}
        <Link
          to="/login"
          className="underline underline-offset-4 hover:text-red-500"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}