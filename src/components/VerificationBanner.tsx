import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle } from "lucide-react";

export const VerificationBanner = () => {
  const { user } = useAuth();

  // The ROLES object is not available on the client, so we use the string literal.
  if (!user || user.role !== "Unverified") {
    return null;
  }

  return (
    <div className="bg-yellow-400/80 border-b border-yellow-500/50 text-yellow-900 p-3 text-center text-sm flex items-center justify-center gap-2 sticky top-0 z-50">
      <AlertTriangle className="h-4 w-4" />
      <span>
        Please verify your email to unlock all features. Your account will be
        deleted in 7 days if not verified.
      </span>
    </div>
  );
};
