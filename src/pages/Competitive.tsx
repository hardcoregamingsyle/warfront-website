import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Trophy, Clock } from "lucide-react";

export default function Competitive() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Warfront | Competitive Tournaments</title>
        <meta name="description" content="Competitive tournaments are coming soon to Warfront." />
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center px-4"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="flex justify-center mb-6"
          >
            <Trophy className="h-20 w-20 text-yellow-400 opacity-80" />
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-bold text-yellow-300 mb-4">Coming Soon</h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-md mx-auto mb-6">
            Competitive tournaments and ranked leagues are under development. Train hard!
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