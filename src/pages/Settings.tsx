import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Volume2, Monitor, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Settings() {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-red-500 mb-2">
            Command Settings
          </h1>
          <p className="text-slate-300">
            Configure your battle preferences and system settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Volume2 className="h-5 w-5" />
                Audio Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="master-volume" className="text-slate-300">Master Volume</Label>
                <Switch id="master-volume" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-effects" className="text-slate-300">Sound Effects</Label>
                <Switch id="sound-effects" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="background-music" className="text-slate-300">Background Music</Label>
                <Switch id="background-music" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Monitor className="h-5 w-5" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="fullscreen" className="text-slate-300">Fullscreen Mode</Label>
                <Switch id="fullscreen" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="high-quality" className="text-slate-300">High Quality Graphics</Label>
                <Switch id="high-quality" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations" className="text-slate-300">Battle Animations</Label>
                <Switch id="animations" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <SettingsIcon className="h-5 w-5" />
                Game Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save" className="text-slate-300">Auto-save Progress</Label>
                <Switch id="auto-save" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="quick-battle" className="text-slate-300">Quick Battle Mode</Label>
                <Switch id="quick-battle" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="tutorials" className="text-slate-300">Show Tutorials</Label>
                <Switch id="tutorials" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="online-status" className="text-slate-300">Show Online Status</Label>
                <Switch id="online-status" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="battle-history" className="text-slate-300">Public Battle History</Label>
                <Switch id="battle-history" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="friend-requests" className="text-slate-300">Allow Friend Requests</Label>
                <Switch id="friend-requests" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
