import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { ArrowRight, History as HistoryIcon, Repeat } from "lucide-react";
import { motion } from "framer-motion";

export default function History() {
  return (
    <DashboardLayout>
      <div className="bg-slate-900 text-white -m-8 p-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center py-8">
            <h1 className="text-5xl font-bold tracking-tight text-red-500 mb-4">
              History
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Review your past activities, including battle outcomes and trade records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link to="/history/battle">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-red-400">
                      <HistoryIcon className="h-6 w-6" />
                      <span className="text-2xl">Battle History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">
                      Analyze your past battles, review your strategies, and learn from your victories and defeats.
                    </p>
                    <div className="flex items-center text-red-400 font-semibold">
                      <span>View Battle History</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            <Link to="/history/trade">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-red-400">
                      <Repeat className="h-6 w-6" />
                      <span className="text-2xl">Trade History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">
                      Keep track of all your trades. See what you've exchanged and with whom.
                    </p>
                    <div className="flex items-center text-red-400 font-semibold">
                      <span>View Trade History</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
