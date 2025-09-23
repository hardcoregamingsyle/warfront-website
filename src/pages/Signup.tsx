import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Helmet } from "react-helmet-async";

const countryList = [
  "United States",
  "Canada",
  "Mexico",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "Australia",
  "Brazil",
  "India",
];

const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
    dob: z.string().min(1, "Date of birth is required"),
    region: z.string().min(1, "Region is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be at most 20 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/,
        "Password must include uppercase, lowercase, number, and symbol"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [countryNames, setCountryNames] = useState<string[]>([]);

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

  useEffect(() => {
    setCountryNames(countryList);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

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

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await signUp({
        name: values.username,
        email: values.email,
        password: values.password,
        region: values.region,
      });
      toast.success(
        "Account created! Please check your email to verify your account.",
      );
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Signup failed:", error);
      const errorMessage = error.data?.data || "An unexpected error occurred.";
      if (errorMessage.includes("This Email is already in use")) {
        form.setError("email", {
          type: "manual",
          message: "This Email is already in use",
        });
      } else if (errorMessage.includes("This Username is already in use")) {
        form.setError("username", {
          type: "manual",
          message: "This Username is already in use",
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4">
      <Helmet>
        <title>Sign Up for Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta
          name="description"
          content="Create your free Warfront account to start your journey. Build your card collection, connect your physical cards, and compete in the digital arena."
        />
      </Helmet>

      {/* Theme Toggle (page level) */}
      <div className="fixed top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="border-slate-600 text-slate-200 hover:bg-slate-800"
          aria-label="Change theme"
          title="Change theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <Card className="w-full max-w-md bg-[var(--header-bg)] border-slate-700">
        <>
          <CardHeader>
            <CardTitle className="text-red-400">Create Your Account</CardTitle>
            <CardDescription className="text-red-400">
              Join the ranks of elite commanders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-red-400">Username</FormLabel>
                      <FormControl>
                        <Input
                          className={`text-white ${
                            isDark
                              ? "placeholder:text-slate-400"
                              : "placeholder:text-red-400/60"
                          }`}
                          placeholder="Your call sign"
                          {...field}
                        />
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
                      <FormLabel className="text-red-400">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          className={`text-white ${
                            isDark
                              ? "placeholder:text-slate-400"
                              : "placeholder:text-red-400/60"
                          }`}
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-red-400">Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-white">
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-slate-700 text-white">
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
                        <FormLabel className="text-red-400">
                          Date of Birth
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className={`text-white ${
                              isDark
                                ? "placeholder:text-slate-400"
                                : "placeholder:text-red-400/60"
                            }`}
                            {...field}
                          />
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
                      <FormLabel className="text-red-400">Region</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-white">
                            <SelectValue placeholder="Select your region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
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
                      <FormLabel className="text-red-400">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className={`text-white ${
                            isDark
                              ? "placeholder:text-slate-400"
                              : "placeholder:text-red-400/60"
                          }`}
                          placeholder="Create a strong password"
                          {...field}
                        />
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
                      <FormLabel className="text-red-400">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className={`text-white ${
                            isDark
                              ? "placeholder:text-slate-400"
                              : "placeholder:text-red-400/60"
                          }`}
                          placeholder="Re-enter your password"
                          {...field}
                        />
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
            <p className="mt-4 text-center text-sm text-slate-300">
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
      </Card>
    </div>
  );
}