import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";

export default function AccountSettings() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Account Settings - Warfront</title>
      </Helmet>
      <div className="bg-black min-h-screen -m-10 p-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-red-400 mb-8">Account Settings</h1>
          <p className="text-slate-300">Manage your account details here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
