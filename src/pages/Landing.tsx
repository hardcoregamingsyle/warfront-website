import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Play,
  X,
} from "lucide-react";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Suspense, lazy } from "react";

const FeaturesSection = lazy(() => import("./landing/FeaturesSection"));
const GameplaySection = lazy(() => import("./landing/GameplaySection"));
const CTASection = lazy(() => import("./landing/CTASection"));
const FooterSection = lazy(() => import("./landing/FooterSection"));

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
              {/* Always show theme toggle */}
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

              {/* Only when NOT authenticated: show Join Battle */}
              {!isAuthenticated && (
                <AuthButton
                  trigger={<Button className="bg-red-600 hover:bg-red-700 text-white">Join Battle</Button>}
                />
              )}

              {/* Only for Admin/Owner: show Admin */}
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
          <AnimatePresence initial={false}>
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
          </AnimatePresence>
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

      {/* Features Section (lazy) */}
      <Suspense fallback={<div className="h-[600px]" />}>
        <FeaturesSection />
      </Suspense>

      {/* Gameplay Section (lazy) */}
      <Suspense fallback={<div className="h-[600px]" />}>
        <GameplaySection />
      </Suspense>

      {/* CTA Section (lazy) */}
      <Suspense fallback={<div className="h-[360px]" />}>
        <CTASection />
      </Suspense>

      {/* Footer (lazy) */}
      <Suspense fallback={<div className="h-[300px]" />}>
        <FooterSection />
      </Suspense>
    </div>
  );
}