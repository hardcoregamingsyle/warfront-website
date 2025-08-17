import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AuthCard } from "./AuthCard";

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? <div>{trigger}</div> : <Button>Get Started</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <AuthCard />
      </DialogContent>
    </Dialog>
  );
}