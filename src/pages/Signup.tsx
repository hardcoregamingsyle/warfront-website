import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters."),
    email: z.string().email("Invalid email address."),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Please select a gender.",
    }),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date of birth.",
    }),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const signupAction = useAction(api.users.signupAction);
  const completeSignup = useMutation(api.users.completeSignup);
  const { signIn } = useAuthActions();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      gender: undefined,
      dob: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleDetailsSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Normalize username and email to lowercase for consistency
      const normalizedData = {
        ...data,
        username: data.username.toLowerCase(),
        email: data.email.toLowerCase(),
      };

      // The availability check is now implicitly handled by the backend during signup.
      // The backend will throw an error if the username is taken, which will be caught here.

      // Filter out confirmPassword before sending to backend
      const signupData = {
        username: normalizedData.username,
        email: normalizedData.email,
        gender: normalizedData.gender,
        dob: normalizedData.dob,
        password: normalizedData.password,
      };

      // Call signup action to store pending user
      await signupAction(signupData);

      // Call signIn to create user and send OTP
      const signInData = new FormData();
      signInData.append("email", normalizedData.email);
      await signIn("email-otp", signInData);

      setEmail(normalizedData.email);
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
    setIsLoading(true);
    setError(null);
    try {
      // Verify OTP
      const signInData = new FormData();
      signInData.append("email", email);
      signInData.append("code", otp);
      await signIn("email-otp", signInData);

      // Complete signup by moving data from pending to users table
      await completeSignup({ email });

      toast.success("Account verified successfully! Please log in.");
      navigate("/login");
    } catch (err: any) {
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-slate-800/50 border-slate-700 text-white">
        {step === "details" ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-red-500">
                Create Your Warfront Account
              </CardTitle>
              <CardDescription className="text-slate-400">
                Join the battle and command your forces to victory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleDetailsSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="General_Patton"
                      className="bg-slate-900/50 border-slate-600 focus:ring-red-500"
                      {...form.register("username")}
                    />
                    {form.formState.errors.username && (
                      <p className="text-red-500 text-sm">{form.formState.errors.username.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@domain.com"
                      className="bg-slate-900/50 border-slate-600 focus:ring-red-500"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup
                      onValueChange={(value) =>
                        form.setValue("gender", value as "male" | "female" | "other")
                      }
                      className="flex gap-4 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.gender && (
                      <p className="text-red-500 text-sm">{form.formState.errors.gender.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      className="bg-slate-900/50 border-slate-600 focus:ring-red-500"
                      {...form.register("dob")}
                    />
                    {form.formState.errors.dob && (
                      <p className="text-red-500 text-sm">{form.formState.errors.dob.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-900/50 border-slate-600 focus:ring-red-500"
                      {...form.register("password")}
                    />
                    {form.formState.errors.password && (
                      <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-900/50 border-slate-600 focus:ring-red-500"
                      {...form.register("confirmPassword")}
                    />
                    {form.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm">{form.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
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
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-slate-400">
                <p>
                  Already have an account?{" "}
                  <Link to="/login" className="text-red-500 hover:underline">
                    Login
                  </Link>
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-red-500">
                Verify Your Email
              </CardTitle>
              <CardDescription className="text-slate-400">
                We've sent a verification code to {email}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
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

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Account"
                  )}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-slate-400">
                <p>
                  Didn't receive a code?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-red-500"
                    onClick={() => setStep("details")}
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