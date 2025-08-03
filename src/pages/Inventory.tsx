import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { Swords, Shield, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Inventory() {
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
            Arsenal Inventory
          </h1>
          <p className="text-slate-300">
            Manage your weapons, equipment, and battle resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Swords className="h-5 w-5" />
                Weapons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Your collection of battle weapons and armaments</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Shield className="h-5 w-5" />
                Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Defensive gear and tactical equipment</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Star className="h-5 w-5" />
                Rare Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Legendary and unique battle artifacts</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
