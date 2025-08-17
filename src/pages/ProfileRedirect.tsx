import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function ProfileRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate(`/profile/${user._id}`);
    } else if (!isLoading && !user) {
      // If not logged in, redirect to login
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-12 w-12" />
    </div>
  );
}