import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { Gamepad2, Users, Trophy, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function JoinBattle() {
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
            Join the Battle
          </h1>
          <p className="text-slate-300">
            Enter the battlefield and prove your tactical supremacy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Users className="h-5 w-5" />
                Quick Match
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">Join a random battle against players of similar skill level</p>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Find Battle
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Trophy className="h-5 w-5" />
                Ranked Match
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">Compete in ranked battles to climb the leaderboards</p>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Enter Ranked
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Gamepad2 className="h-5 w-5" />
                Private Match
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">Create or join a private battle with friends</p>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Create Room
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Clock className="h-5 w-5" />
                Tournament
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">Participate in scheduled tournaments for exclusive rewards</p>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                View Tournaments
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
