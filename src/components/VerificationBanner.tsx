import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

export const VerificationBanner = () => {
  const { user, token } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const resendEmail = useMutation(api.users.resendVerificationEmail);

  // The ROLES object is not available on the client, so we use the string literal.
  if (!user || user.role !== "Unverified") {
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    try {
      // Directly read from localStorage as a fallback to ensure token is available
      const sessionToken = token || localStorage.getItem("auth_token");

      if (!sessionToken) {
        toast.error("You are not logged in. Please log in again.");
        setIsSending(false);
        return;
      }
      await resendEmail({ token: sessionToken });
      toast.success("A new verification link has been sent to your email.");
    } catch (error: any) {
      const message =
        error.data?.data || "Failed to send email. Please try again later.";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-yellow-400/80 border-b border-yellow-500/50 text-yellow-900 p-3 text-center text-sm flex items-center justify-center gap-4 sticky top-0 z-50 flex-wrap">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>
          Please verify your email to unlock all features. Your account will be
          deleted in 7 days if not verified.
        </span>
      </div>
      <Button
        variant="link"
        className="text-yellow-900 h-auto p-0 underline hover:text-yellow-950 disabled:text-yellow-900/70"
        onClick={handleResend}
        disabled={isSending}
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          "Resend verification link"
        )}
      </Button>
    </div>
  );
};