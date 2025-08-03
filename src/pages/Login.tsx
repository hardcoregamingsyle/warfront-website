import { AuthCard } from "@/components/auth/AuthCard";
import { Link } from "react-router";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Link to="/">
          <img
            src="/assets/Untitled_design.png"
            alt="Warfront Logo"
            className="h-12 w-auto"
          />
        </Link>
      </div>
      <AuthCard />
      <p className="text-center text-sm text-muted-foreground mt-4">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
