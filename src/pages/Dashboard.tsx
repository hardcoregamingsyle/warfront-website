import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { Swords, Shield, Users, Trophy, Target, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Deploy Now
                </Button>
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
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  View Inventory
                </Button>
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
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Find Match
                </Button>
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
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Enter Arena
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Target className="h-5 w-5" />
                  Combat Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-slate-300">
                  <span>Battles Won:</span>
                  <span className="text-red-400 font-bold">0</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Win Rate:</span>
                  <span className="text-red-400 font-bold">0%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Current Rank:</span>
                  <span className="text-red-400 font-bold">Recruit</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Shield className="h-5 w-5" />
                  Equipment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-slate-300">
                  <span>Weapons:</span>
                  <span className="text-red-400 font-bold">0</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Armor Sets:</span>
                  <span className="text-red-400 font-bold">0</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Rare Items:</span>
                  <span className="text-red-400 font-bold">0</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-slate-300 text-sm">
                  <div className="text-red-400 font-semibold">Account Created</div>
                  <div className="text-slate-500">Welcome to Warfront!</div>
                </div>
                <div className="text-slate-300 text-sm">
                  <div className="text-red-400 font-semibold">Tutorial Available</div>
                  <div className="text-slate-500">Learn the basics of combat</div>
                </div>
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
                  <Button size="lg" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10 px-8">
                    Browse Arsenal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}