import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const resetPassword = useMutation(api.users.resetPassword);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const urlToken = new URLSearchParams(location.search).get("token");
    if (!urlToken) {
      toast.error("Invalid password reset link");
      navigate("/forgot-password");
      return;
    }
    setToken(urlToken);
  }, [location, navigate]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Invalid password reset link");
      return;
    }

    try {
      const message = await resetPassword({
        token,
        newPassword: values.newPassword,
      });
      toast.success(message);
      navigate("/login");
    } catch (error: any) {
      console.error("Password reset failed:", error);
      const errorMessage = error.data?.data || "An unexpected error occurred.";
      toast.error(errorMessage);
      
      if (errorMessage.includes("invalid") || errorMessage.includes("expired")) {
        setTimeout(() => navigate("/forgot-password"), 2000);
      }
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-red-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-400" />
              <p>Validating reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <Helmet>
        <title>Reset Password - Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta
          name="description"
          content="Set a new password for your Warfront account."
        />
      </Helmet>
      <Card className="w-full max-w-md bg-slate-800 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
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
                    <FormLabel>Confirm New Password</FormLabel>
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
                Reset Password
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-slate-400">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-red-400 hover:text-red-500"
            >
              Back to Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
