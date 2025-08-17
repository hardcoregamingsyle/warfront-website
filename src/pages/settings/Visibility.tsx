import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";

export default function VisibilitySettings() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Visibility Settings - Warfront</title>
      </Helmet>
      <div className="bg-black min-h-screen -m-10 p-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-red-400 mb-8">Visibility Settings</h1>
          <p className="text-slate-300">Control who can see your profile.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
