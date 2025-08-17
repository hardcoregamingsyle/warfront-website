import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

interface AuthButtonProps {
  trigger?: React.ReactNode;
  dashboardTrigger?: React.ReactNode;
}

export function AuthButton({ trigger, dashboardTrigger }: AuthButtonProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Button disabled>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      </Button>
    );
  }

  if (isAuthenticated) {
    return dashboardTrigger ? (
      <div>{dashboardTrigger}</div>
    ) : (
      <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
    );
  }

  return trigger ? (
    <div onClick={() => navigate("/login")}>{trigger}</div>
  ) : (
    <Button onClick={() => navigate("/login")}>Get Started</Button>
  );
}