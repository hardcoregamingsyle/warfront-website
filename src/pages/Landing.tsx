import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Menu,
  Play,
  Shield,
  Star,
  Sword,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

  const { isAuthenticated, user } = useAuth();
  const isAdminOrOwner =
    !!user &&
    (
      (user.role === "Admin" || user.role === "Owner") ||
      (typeof user.email === "string" && user.email.toLowerCase() === "hardcorgamingstyle@gmail.com")
    );

  // Preload background image for better performance
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/camouflage-seamless-pattern-for-army-and-military-free-vector.jpg';
    // Also preload the dark-mode uploaded background
    const darkImg = new Image();
    darkImg.src = 'https://harmless-tapir-303.convex.cloud/api/storage/bace9929-c4de-4d8d-a3de-0b6ae569c325';
  }, []);

  // Apply theme to document root
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Combat for the Digital Age – Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
        <link rel="preload" as="image" href="/assets/camouflage-seamless-pattern-for-army-and-military-free-vector.jpg" />
        {/* Preload uploaded dark-mode background for faster first render */}
        <link rel="preload" as="image" href="https://harmless-tapir-303.convex.cloud/api/storage/bace9929-c4de-4d8d-a3de-0b6ae569c325" />
        <meta name="description" content="Experience Warfront, the family-friendly military TCG & CCG. Battle online with friends or play offline with physical cards. A perfect mix of combat, strategy, and fun for all ages." />
        <meta name="keywords" content="Warfront, Military, War, War Front, Game, Gaming, TCG, CCG, collectibles, card, card game, collectible card game, trading, trading card game, trading game, war game, military game, fun, family, family friendly, family friendly game, card games online, online games, fun games, Warfront, TCG, CCG, card game, online card game, offline card game, military theme, strategy game, family-friendly, collectible card game, physical cards, digital cards" />
        <meta property="og:title" content="Warfront: A Family-Friendly TCG for the Digital Age" />
        <meta property="og:description" content="Build your deck and dominate the battlefield in this new military-themed card game you can play both online and offline with family and friends." />
        <meta property="og:image" content="https://www.reddit.com/r/letsplay/comments/12vghll/any_one_knows_where_do_people_get_highres_game/" />
        <meta property="og:url" content="https://warfront.vly.site/" />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 bg-[var(--header-bg)] backdrop-blur-sm border-b border-slate-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/assets/Logo.png" alt="Warfront Logo" className="h-12 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#gameplay" className="text-slate-300 hover:text-white transition-colors">Gameplay</a>
              <a href="#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
              {isAuthenticated && isAdminOrOwner && (
                <Link to="/admin" className="text-slate-300 hover:text-white transition-colors">Admin</Link>
              )}
            </div>

            {/* Desktop Actions */}
            {/* When NOT authenticated: show theme toggle + Join Battle.
                When authenticated and NOT admin: show nothing (only navbar links remain).
                When authenticated and admin: show extra Admin button. */}
            <div className="hidden md:flex items-center gap-3">
              {!isAuthenticated && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    className="border-slate-600 text-slate-200 hover:bg-slate-800"
                    aria-label="Change theme"
                    title="Change theme"
                  >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                  <AuthButton 
                    trigger={<Button className="bg-red-600 hover:bg-red-700 text-white">Join Battle</Button>}
                  />
                </>
              )}
              {isAuthenticated && isAdminOrOwner && (
                <Link to="/admin">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">Admin</Button>
                </Link>
              )}
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
              className="md:hidden bg-[var(--header-bg)] border-t border-slate-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-slate-300 hover:text-white">Features</a>
                <a href="#gameplay" className="block px-3 py-2 text-slate-300 hover:text-white">Gameplay</a>
                <a href="#contact" className="block px-3 py-2 text-slate-300 hover:text-white">Contact</a>
                {isAuthenticated && isAdminOrOwner && (
                  <Link to="/admin" className="block px-3 py-2">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Admin</Button>
                  </Link>
                )}
                <div className="px-3 py-2 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toggleTheme();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full border-slate-600 text-slate-200 hover:bg-slate-800"
                  >
                    {isDark ? (
                      <span className="flex items-center gap-2"><Sun className="h-4 w-4" /> Light</span>
                    ) : (
                      <span className="flex items-center gap-2"><Moon className="h-4 w-4" /> Dark</span>
                    )}
                  </Button>
                  {!isAuthenticated && (
                    <AuthButton 
                      trigger={<Button className="w-full bg-red-600 hover:bg-red-700 text-white">Join Battle</Button>}
                    />
                  )}
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
              <AuthButton 
                trigger={
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg">
                    <Play className="mr-2 h-5 w-5" />
                    Start Playing
                  </Button>
                }
              />
            </motion.div>
          </div>
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
              <Link to="/how-to-play">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Learn How to Play
                </Button>
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
            <div className="flex justify-center">
              <AuthButton 
                trigger={
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg">
                    <Play className="mr-2 h-5 w-5" />
                    Start Your Campaign
                  </Button>
                }
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 border-t border-slate-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <img src="/assets/Logo.png" alt="Warfront Logo" className="h-12 w-auto" />
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
                <li><a href="https://discord.gg/BjH5NSWYGM" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="https://www.youtube.com/channel/UCAoKv9QSWtPZkxGA97kVfvw?subscribe" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a></li>
                <li><a href="https://www.facebook.com/profile.php?id=61579598579273" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
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