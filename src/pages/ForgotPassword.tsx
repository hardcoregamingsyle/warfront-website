import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
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
import { useState } from "react";
import { Helmet } from "react-helmet-async";

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const requestReset = useMutation(api.users.requestPasswordReset);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const message = await requestReset({ identifier: values.identifier });
      toast.success(message);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Password reset request failed:", error);
      const errorMessage = error.data?.data || "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <Helmet>
          <title>Password Reset Sent - Warfront</title>
          <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        </Helmet>
        <Card className="w-full max-w-md bg-slate-800 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">Check Your Email</CardTitle>
            <CardDescription>
              If an account with that email/username exists, we've sent you a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Check your email for a password reset link. If you don't see it, check your spam folder.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/login">Back to Login</Link>
                </Button>
                <Button 
                  onClick={() => setIsSubmitted(false)} 
                  variant="ghost" 
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <Helmet>
        <title>Forgot Password - Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta
          name="description"
          content="Reset your Warfront password. Enter your email or username to receive a password reset link."
        />
      </Helmet>
      <Card className="w-full max-w-md bg-slate-800 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email or username and we'll send you a link to reset your password.
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
                    <FormLabel>Email or Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email or username"
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
                Send Reset Link
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
