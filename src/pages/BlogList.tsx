import DashboardLayout from "@/layouts/DashboardLayout";
import { Link } from "react-router";

export default function BlogList() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Mission Briefings</h1>
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold">Coming Soon</h2>
            <p className="text-slate-400">We are currently preparing the mission briefings. Check back later for updates.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}