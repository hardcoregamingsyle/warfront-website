import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { Swords, Shield, Users, Trophy, Target, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="bg-slate-900 text-white -m-8 p-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center py-8">
            <h1 className="text-5xl font-bold tracking-tight text-red-500 mb-4">
              Command Center
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Welcome to your military headquarters. Deploy your forces, manage your arsenal, and dominate the battlefield.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Swords className="h-5 w-5" />
                  Quick Battle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm mb-4">Jump into combat immediately</p>
                <Link to="/battle">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Deploy Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Shield className="h-5 w-5" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm mb-4">Manage your weapons and gear</p>
                <Link to="/inventory">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    View Inventory
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Users className="h-5 w-5" />
                  Multiplayer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm mb-4">Challenge other commanders</p>
                <Link to="/multi_battle">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Find Match
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Trophy className="h-5 w-5" />
                  Tournaments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm mb-4">Compete for glory and rewards</p>
                <Link to="/competetive">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Enter Arena
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center py-8">
            <Card className="bg-gradient-to-r from-red-900/20 to-slate-900/20 border-red-500/30">
              <CardContent className="py-8">
                <h2 className="text-3xl font-bold text-red-400 mb-4">Ready for Your First Battle?</h2>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Your military campaign awaits. Choose your strategy, deploy your forces, and claim victory on the battlefield.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
                    Start Tutorial
                  </Button>
                  <Link to="/inventory">
                    <Button size="lg" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10 px-8">
                      View Inventory
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}