import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center"
      >
        <div className="max-w-5xl mx-auto relative px-4">
          <h1 className="text-4xl font-bold text-center">Welcome to the Dashboard</h1>
          <p className="text-muted-foreground text-center mt-2">
            This is where the main game content will be.
          </p>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}