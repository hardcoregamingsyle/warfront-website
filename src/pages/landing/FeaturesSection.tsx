import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, Star, Sword, Target, Trophy, Users } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Battle Features
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Experience warfare like never before with our advanced tactical systems
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Sword className="h-8 w-8 text-red-500" />,
              title: "Strategic Combat",
              description: "Deploy units with unique abilities and create devastating combinations",
            },
            {
              icon: <Shield className="h-8 w-8 text-blue-500" />,
              title: "Defensive Tactics",
              description: "Build fortifications and defensive lines to protect your territory",
            },
            {
              icon: <Target className="h-8 w-8 text-green-500" />,
              title: "Precision Strikes",
              description: "Execute targeted attacks to eliminate key enemy positions",
            },
            {
              icon: <Users className="h-8 w-8 text-purple-500" />,
              title: "Multiplayer Battles",
              description: "Challenge players worldwide in ranked competitive matches",
            },
            {
              icon: <Trophy className="h-8 w-8 text-yellow-500" />,
              title: "Tournament Mode",
              description: "Compete in seasonal tournaments for exclusive rewards",
            },
            {
              icon: <Star className="h-8 w-8 text-orange-500" />,
              title: "Card Collection",
              description: "Collect rare cards and build the ultimate military deck",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors h-full">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
