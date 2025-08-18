import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function BlogEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !["admin", "owner"].includes(user.role!)) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (!user) {
    return (
        <DashboardLayout>
            <div className="container mx-auto py-8">
                <p>Loading...</p>
            </div>
        </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Blog Editor</h1>
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold">Coming Soon</h2>
            <p className="text-slate-400">The rich-text editor for creating mission briefings is under construction.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}