import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function Profile() {
  const { user } = useAuth();

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
            Commander Profile
          </h1>
          <p className="text-slate-300">
            Your military service record and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="h-4 w-4" />
                <span>Name: {user?.name || "Commander"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="h-4 w-4" />
                <span>Email: {user?.email || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="h-4 w-4" />
                <span>Enlisted: {new Date().toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Trophy className="h-5 w-5" />
                Battle Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Battles Won:</span>
                <span className="text-red-400 font-bold">0</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Battles Lost:</span>
                <span className="text-red-400 font-bold">0</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Win Rate:</span>
                <span className="text-red-400 font-bold">0%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Rank:</span>
                <span className="text-red-400 font-bold">Recruit</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
