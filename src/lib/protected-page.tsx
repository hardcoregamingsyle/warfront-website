import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export function Protected({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin " />
      </div>
    );
  }

  return <>{children}</>;
}