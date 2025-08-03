import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Shield, 
  Sword, 
  Target, 
  Users, 
  Trophy, 
  Star,
  Play,
  Download,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold text-white tracking-tight">WARFRONT</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#gameplay" className="text-slate-300 hover:text-white transition-colors">Gameplay</a>
              <a href="#tournaments" className="text-slate-300 hover:text-white transition-colors">Tournaments</a>
              <a href="#community" className="text-slate-300 hover:text-white transition-colors">Community</a>
              <a href="#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
            </div>

            {/* Auth Button */}
            <div className="hidden md:block">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Join Battle
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden bg-slate-800 border-t border-slate-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-slate-300 hover:text-white">Features</a>
                <a href="#gameplay" className="block px-3 py-2 text-slate-300 hover:text-white">Gameplay</a>
                <a href="#tournaments" className="block px-3 py-2 text-slate-300 hover:text-white">Tournaments</a>
                <a href="#community" className="block px-3 py-2 text-slate-300 hover:text-white">Community</a>
                <a href="#contact" className="block px-3 py-2 text-slate-300 hover:text-white">Contact</a>
                <div className="px-3 py-2">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Join Battle
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                DOMINATE THE
                <span className="block text-red-500">BATTLEFIELD</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
                Command your forces in the ultimate military strategy card game. 
                Deploy tactics, outmaneuver enemies, and claim victory in intense battles.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Start Playing
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 py-4 text-lg">
                <Download className="mr-2 h-5 w-5" />
                Download Game
              </Button>
            </motion.div>
          </div>

          {/* Hero Image/Video Placeholder */}
          <motion.div 
            className="mt-16 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="bg-slate-800 rounded-lg border border-slate-700 aspect-video flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Game Trailer</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
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
                description: "Deploy units with unique abilities and create devastating combinations"
              },
              {
                icon: <Shield className="h-8 w-8 text-blue-500" />,
                title: "Defensive Tactics",
                description: "Build fortifications and defensive lines to protect your territory"
              },
              {
                icon: <Target className="h-8 w-8 text-green-500" />,
                title: "Precision Strikes",
                description: "Execute targeted attacks to eliminate key enemy positions"
              },
              {
                icon: <Users className="h-8 w-8 text-purple-500" />,
                title: "Multiplayer Battles",
                description: "Challenge players worldwide in ranked competitive matches"
              },
              {
                icon: <Trophy className="h-8 w-8 text-yellow-500" />,
                title: "Tournament Mode",
                description: "Compete in seasonal tournaments for exclusive rewards"
              },
              {
                icon: <Star className="h-8 w-8 text-orange-500" />,
                title: "Card Collection",
                description: "Collect rare cards and build the ultimate military deck"
              }
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

      {/* Gameplay Section */}
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
                  "Multiple victory conditions"
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-slate-300">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Learn How to Play
              </Button>
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

      {/* Tournaments Section */}
      <section id="tournaments" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Competitive Warfare
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
              Rise through the ranks and prove your tactical superiority in our competitive tournament system
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Weekly Battles",
                description: "Fast-paced tournaments every week",
                prize: "$500 Prize Pool"
              },
              {
                title: "Monthly Championships",
                description: "Elite competition for the best players",
                prize: "$2,000 Prize Pool"
              },
              {
                title: "Annual World Cup",
                description: "The ultimate Warfront championship",
                prize: "$10,000 Prize Pool"
              }
            ].map((tournament, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-6">
                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">{tournament.title}</h3>
                    <p className="text-slate-300 mb-4">{tournament.description}</p>
                    <p className="text-green-400 font-bold">{tournament.prize}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
            View Tournament Schedule
          </Button>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Join the Regiment
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
              Connect with fellow commanders, share strategies, and stay updated on the latest battlefield intel
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { platform: "Discord", members: "50K+ Members", color: "bg-indigo-600" },
              { platform: "Reddit", members: "25K+ Subscribers", color: "bg-orange-600" },
              { platform: "Twitter", members: "100K+ Followers", color: "bg-blue-600" },
              { platform: "YouTube", members: "75K+ Subscribers", color: "bg-red-600" }
            ].map((social, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${social.color} rounded-lg mx-auto mb-4 flex items-center justify-center`}>
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{social.platform}</h3>
                    <p className="text-slate-300 text-sm">{social.members}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
            Join Community
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-900/20 to-slate-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready for Battle?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of commanders already dominating the battlefield. 
              Your military campaign starts now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Start Your Campaign
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 py-4 text-lg">
                <Download className="mr-2 h-5 w-5" />
                Download Free
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 border-t border-slate-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-red-500" />
                <span className="text-xl font-bold text-white">WARFRONT</span>
              </div>
              <p className="text-slate-400">
                The ultimate military strategy card game experience.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Game</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Download</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Requirements</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Release Notes</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Community</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Forums</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tournaments</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bug Reports</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Warfront. All rights reserved. Built for tactical supremacy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}