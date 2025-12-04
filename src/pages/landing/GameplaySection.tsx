import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Link } from "react-router";

export default function GameplaySection() {
  return (
    <section id="gameplay" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Master the Art of War
            </h2>
            <p className="text-lg text-slate-300 mb-6">
              Every decision matters in Warfront. Plan your moves, anticipate enemy tactics,
              and adapt your strategy in real-time battles that will test your military prowess.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Turn-based tactical gameplay",
                "Resource management systems",
                "Dynamic battlefield conditions",
                "Multiple victory conditions",
              ].map((item, index) => (
                <li key={index} className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/how-to-play">
              <Button className="bg-red-600 hover:bg-red-700 text-white">Learn How to Play</Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-slate-800 rounded-lg border border-slate-700 aspect-square flex items-center justify-center">
              <div className="text-center">
                <Target className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Gameplay Screenshot</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}