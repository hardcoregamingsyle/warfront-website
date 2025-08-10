import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { countries } from "countries-list";
import { useAuth } from "@/hooks/use-auth";

const countryNames = Object.values(countries).map((country) => country.name);

const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
    dob: z.string().min(1, "Date of birth is required"),
    region: z.string().min(1, "Region is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const otpSchema = z.object({
  verificationCode: z.string().length(6, "Your one-time password must be 6 characters."),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function Signup() {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [emailForOtp, setEmailForOtp] = useState("");
  const navigate = useNavigate();

  const startSignup = useAction(api.users.startSignup);
  const verifyOtpAndCreateUser = useMutation(api.users.verifyOtpAndCreateUser);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      gender: "prefer_not_to_say" as const,
      dob: "",
      region: "",
      password: "",
      confirmPassword: "",
    },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { verificationCode: "" },
  });

  const onDetailsSubmit = async (values: SignupFormValues) => {
    try {
      await startSignup({
        username: values.username,
        email: values.email,
        password: values.password,
        gender: values.gender,
        dob: values.dob,
        region: values.region,
      });
      setEmailForOtp(values.email);
      setStep("otp");
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast.error(
        error.message || "Failed to start signup. Please try again.",
      );
    }
  };

  const { setToken } = useAuth();
  const onOtpSubmit = async (values: OtpFormValues) => {
    try {
      const { token } = await verifyOtpAndCreateUser({
        email: emailForOtp,
        otp: values.verificationCode,
      });
      setToken(token);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      toast.error(
        error?.data?.message || error?.data || "Invalid OTP or request expired.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-red-500/20">
        {step === "details" ? (
          <>
            <CardHeader>
              <CardTitle className="text-red-400">Create Your Account</CardTitle>
              <CardDescription>
                Join the ranks of elite commanders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onDetailsSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Your call sign" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer_not_to_say">
                                Prefer not to say
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countryNames.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Account
                  </Button>
                </form>
              </Form>
              <p className="mt-4 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-red-400 hover:text-red-500"
                >
                  Log in
                </Link>
              </p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-red-400">Verify Your Email</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to {emailForOtp}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...otpForm}>
                <form
                  onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                  className="space-y-6"
                  autoComplete="off"
                >
                  <FormField
                    control={otpForm.control}
                    name="verificationCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password</FormLabel>
                        <FormControl>
                          <Input
                            maxLength={6}
                            {...field}
                            placeholder="______"
                            autoComplete="off"
                            className="text-center text-2xl tracking-[0.8em]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={otpForm.formState.isSubmitting}
                  >
                    {otpForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Verify and Sign Up
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}