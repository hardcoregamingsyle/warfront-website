import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Play, X, Sun, Moon } from "lucide-react";
import { useState, useEffect, Suspense, lazy, memo } from "react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";

const FeaturesSection = lazy(() => import("./landing/FeaturesSection.tsx"));
const GameplaySection = lazy(() => import("./landing/GameplaySection.tsx"));
const CTASection = lazy(() => import("./landing/CTASection.tsx"));
const FooterSection = lazy(() => import("./landing/FooterSection.tsx"));

const LoadingFallback = memo(({ height }: { height: string }) => (
  <div className={`${height} flex items-center justify-center`}>
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
  </div>
));

const Navigation = memo(({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  isDark, 
  toggleTheme, 
  isAuthenticated, 
  isAdminOrOwner 
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isDark: boolean;
  toggleTheme: () => void;
  isAuthenticated: boolean;
  isAdminOrOwner: boolean;
}) => (
  <motion.nav 
    className="fixed top-0 w-full z-50 bg-[var(--header-bg)] backdrop-blur-md border-b border-slate-700/50 shadow-lg"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <img src="/assets/Logo.png" alt="Warfront Logo" className="h-12 w-auto" loading="eager" />
        </motion.div>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-slate-300 hover:text-white transition-colors duration-200">Features</a>
          <a href="#gameplay" className="text-slate-300 hover:text-white transition-colors duration-200">Gameplay</a>
          <a href="#contact" className="text-slate-300 hover:text-white transition-colors duration-200">Contact</a>
          {isAuthenticated && isAdminOrOwner && (
            <Link to="/admin" className="text-slate-300 hover:text-white transition-colors duration-200">Admin</Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="border-slate-600 text-slate-200 hover:bg-slate-800 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {!isAuthenticated && (
            <AuthButton
              trigger={<Button className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200">Join Battle</Button>}
            />
          )}

          {isAuthenticated && isAdminOrOwner && (
            <Link to="/admin">
              <Button className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200">Admin</Button>
            </Link>
          )}
        </div>

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

      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-[var(--header-bg)] border-t border-slate-700/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#gameplay" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">Gameplay</a>
              <a href="#contact" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors">Contact</a>
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
));

const HeroSection = memo(({ isAuthenticated }: { isAuthenticated: boolean }) => (
  <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-tight">
            DOMINATE THE
            <span className="block text-red-500 mt-2">BATTLEFIELD</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Command your forces in the ultimate military strategy card game. 
            Deploy tactics, outmaneuver enemies, and claim victory in intense battles.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <AuthButton 
            trigger={
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-200">
                <Play className="mr-2 h-6 w-6" />
                Start Playing
              </Button>
            }
          />
        </motion.div>
      </div>
    </div>
  </section>
));

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
        <link rel="preload" as="image" href="/assets/Logo.png" />
        <meta name="description" content="Experience Warfront, the family-friendly military TCG & CCG. Battle online with friends or play offline with physical cards. A perfect mix of combat, strategy, and fun for all ages." />
        <meta name="keywords" content="Warfront, Military, War, TCG, CCG, card game, strategy game, family-friendly, collectible card game" />
        <meta property="og:title" content="Warfront: A Family-Friendly TCG for the Digital Age" />
        <meta property="og:description" content="Build your deck and dominate the battlefield in this new military-themed card game you can play both online and offline with family and friends." />
        <meta property="og:url" content="https://warfront.vly.site/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navigation 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isDark={isDark}
        toggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
        isAdminOrOwner={isAdminOrOwner}
      />

      <HeroSection isAuthenticated={isAuthenticated} />

      <Suspense fallback={<LoadingFallback height="h-[600px]" />}>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={<LoadingFallback height="h-[600px]" />}>
        <GameplaySection />
      </Suspense>

      <Suspense fallback={<LoadingFallback height="h-[360px]" />}>
        <CTASection />
      </Suspense>

      <Suspense fallback={<LoadingFallback height="h-[300px]" />}>
        <FooterSection />
      </Suspense>
    </div>
  );
}