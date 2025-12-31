import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, Star, Sword, Target, Trophy, Users } from "lucide-react";
import { memo } from "react";

const features = [
  {
    icon: Sword,
    color: "text-red-500",
    title: "Strategic Combat",
    description: "Deploy units with unique abilities and create devastating combinations",
  },
  {
    icon: Shield,
    color: "text-blue-500",
    title: "Defensive Tactics",
    description: "Build fortifications and defensive lines to protect your territory",
  },
  {
    icon: Target,
    color: "text-green-500",
    title: "Precision Strikes",
    description: "Execute targeted attacks to eliminate key enemy positions",
  },
  {
    icon: Users,
    color: "text-purple-500",
    title: "Multiplayer Battles",
    description: "Challenge players worldwide in ranked competitive matches",
  },
  {
    icon: Trophy,
    color: "text-yellow-500",
    title: "Tournament Mode",
    description: "Compete in seasonal tournaments for exclusive rewards",
  },
  {
    icon: Star,
    color: "text-orange-500",
    title: "Card Collection",
    description: "Collect rare cards and build the ultimate military deck",
  },
];

const FeatureCard = memo(({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const Icon = feature.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Card className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-all duration-300 h-full hover:shadow-xl">
        <CardContent className="p-6">
          <div className="mb-4">
            <Icon className={`h-8 w-8 ${feature.color}`} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
          <p className="text-slate-300 leading-relaxed">{feature.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default memo(function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Battle Features
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Experience warfare like never before with our advanced tactical systems
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});