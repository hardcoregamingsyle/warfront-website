import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Helmet } from "react-helmet-async";

const settingsOptions = [
  { title: "Account", description: "Manage your account details." },
  { title: "Security", description: "Change your password and manage access." },
  { title: "Visibility", description: "Control who can see your profile." },
  { title: "Social Media", description: "Connect your social media accounts." },
];

export default function Settings() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Settings - Warfront</title>
        <meta name="description" content="Manage your Warfront account settings, including security, visibility, and connected social media accounts." />
      </Helmet>
      <div className="bg-black min-h-screen -m-10 p-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-red-400 mb-8">Settings</h1>
          <div className="space-y-4">
            {settingsOptions.map((option) => (
              <Button
                key={option.title}
                variant="ghost"
                className="w-full flex justify-between items-center p-6 text-left bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                <div>
                  <h2 className="text-xl font-semibold text-white">{option.title}</h2>
                  <p className="text-slate-400">{option.description}</p>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-500" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}