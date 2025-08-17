import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";

export default function SecuritySettings() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Security Settings - Warfront</title>
      </Helmet>
      <div className="bg-black min-h-screen -m-10 p-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-red-400 mb-8">Security Settings</h1>
          <p className="text-slate-300">Change your password and manage access.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
