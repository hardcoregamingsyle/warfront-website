import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { BookOpen, Target, Shield, Sword } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HowToPlay() {
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
            Battle Manual
          </h1>
          <p className="text-slate-300">
            Master the art of war with our comprehensive guide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <BookOpen className="h-5 w-5" />
                Basic Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300">
                <li>• Deploy units strategically on the battlefield</li>
                <li>• Manage resources and energy efficiently</li>
                <li>• Destroy enemy headquarters to win</li>
                <li>• Use terrain advantages to your benefit</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Target className="h-5 w-5" />
                Combat Tactics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300">
                <li>• Plan your attacks carefully</li>
                <li>• Use unit combinations for maximum effect</li>
                <li>• Time your special abilities wisely</li>
                <li>• Adapt to enemy strategies</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Shield className="h-5 w-5" />
                Defense Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300">
                <li>• Build defensive structures early</li>
                <li>• Position units to cover weak points</li>
                <li>• Use counter-attacks effectively</li>
                <li>• Maintain supply lines</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Sword className="h-5 w-5" />
                Advanced Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300">
                <li>• Study opponent patterns</li>
                <li>• Master unit micro-management</li>
                <li>• Control key strategic points</li>
                <li>• Practice different army compositions</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
