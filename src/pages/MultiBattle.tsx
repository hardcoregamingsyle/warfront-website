import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { Users, Clock } from "lucide-react";

export default function MultiBattle() {
  return (
    <DashboardLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center px-4"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            className="flex justify-center mb-6"
          >
            <Users className="h-20 w-20 text-blue-400 opacity-80" />
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-bold text-yellow-300 mb-4">Coming Soon</h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-md mx-auto mb-6">
            Multiplayer battles are currently under development. Rally your squad!
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Clock className="h-5 w-5" />
            <span>Stay tuned for updates</span>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}