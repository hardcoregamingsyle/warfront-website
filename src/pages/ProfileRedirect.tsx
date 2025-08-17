import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

export default function ProfileRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate(`/profile/${user._id}`);
    }
    if (!isLoading && !user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-red-500" />
    </div>
  );
}