import { useAuth } from "@/hooks/use-auth";
import { Suspense, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

function SignIn() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(searchParams.get("redirect") || "/");
    }
  }, [isLoading, isAuthenticated, searchParams, navigate]);

  useEffect(() => {
    // Redirect to login page since we removed AuthCard
    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirecting to login...</p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}