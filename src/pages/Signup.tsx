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
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Mail, User, Calendar, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender.",
  }),
  dob: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "Please enter your date of birth.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Signup() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const convex = useConvex();
  const updateUserProfile = useMutation(api.users.updateUserProfile);

  const [step, setStep] = useState<"details" | "otp">("details");
  const [formData, setFormData] = useState<FormData | null>(null);
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
      const availability = await convex.query(api.users.checkAvailability, {
        username: data.username,
        email: data.email,
      });
      if (!availability?.available) {
        setError(availability?.message || "Username or email is unavailable.");
        setIsLoading(false);
        return;
      }

      const form = new FormData();
      form.append("email", data.email);
      await signIn("email-otp", form);
      setFormData(data);
      setStep("otp");
    } catch (err) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData) return;

    setIsLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("email", formData.email);
      form.append("code", otp);
      await signIn("email-otp", form);

      await updateUserProfile({
        username: formData.username,
        gender: formData.gender,
        dob: formData.dob,
      });

      toast.success("Account created successfully!");
      navigate("/dashboard");
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
      <Card className="w-full max-w-md">
        {step === "details" ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>
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
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      {...form.register("username")}
                      placeholder="Your callsign"
                      className="pl-9"
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
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      {...form.register("email")}
                      placeholder="name@example.com"
                      type="email"
                      className="pl-9"
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
                        form.watch("gender") === "male" ? "default" : "outline"
                      }
                      onClick={() =>
                        form.setValue("gender", "male", { shouldValidate: true })
                      }
                      className="flex-1"
                    >
                      Male
                    </Button>
                    <Button
                      type="button"
                      variant={
                        form.watch("gender") === "female"
                          ? "default"
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
                        form.watch("gender") === "other" ? "default" : "outline"
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
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dob"
                      {...form.register("dob")}
                      type="date"
                      className="pl-9"
                    />
                  </div>
                  {form.formState.errors.dob && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.dob.message}
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
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
              <CardTitle>Check your email</CardTitle>
              <CardDescription>
                We've sent a code to {formData?.email}
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
                        <InputOTPSlot key={index} index={index} />
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
                  className="w-full mt-6"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Verify and Create Account"
                  )}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Didn't receive a code?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setStep("details")}
                >
                  Try again
                </Button>
              </p>
            </CardContent>
          </>
        )}
      </Card>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link
          to="/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
