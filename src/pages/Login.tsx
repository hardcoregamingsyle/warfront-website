import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, useLocation } from "react-router";
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
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Sun, Moon } from "lucide-react";

const loginSchema = z.object({
  identifier: z.string().min(1, "Please enter your email or username"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

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

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await signIn({ identifier: values.identifier, password: values.password });
      toast.success("Logged in successfully!");
      const redirect = new URLSearchParams(location.search).get("redirect");
      navigate(redirect || "/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.data;
      if (errorMessage === "Incorrect Username or Password") {
        setFormError(errorMessage);
      } else {
        setFormError("An Unexpected Error Occurred. Please try again Later");
      }
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4">
      <Helmet>
        <title>Login to Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
        <meta name="description" content="Log in to your Warfront account to access your physical card collection, play online, and manage your profile." />
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
        <CardHeader>
          <CardTitle className="text-red-400">Welcome Back, Commander</CardTitle>
          <CardDescription className="text-red-400">
            Enter your credentials to access the command center.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-red-400">Email or Username</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        className={`text-white ${
                          isDark
                            ? "placeholder:text-slate-400"
                            : "placeholder:text-white"
                        }`}
                        placeholder="Your call sign or email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-red-400">Password</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-red-400 hover:text-red-500"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        className={`text-white ${
                          isDark
                            ? "placeholder:text-slate-400"
                            : "placeholder:text-white"
                        }`}
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {formError && (
                <p className="text-sm font-medium text-destructive">{formError}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Log In
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-slate-300">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-red-400 hover:text-red-500"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}