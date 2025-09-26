import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/UserButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { motion } from "framer-motion";
import { Swords, Shield, Gamepad2, HelpCircle, Menu, X, Users, History } from "lucide-react";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add theme state + initializer
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("theme");
    if (saved === "light") return false;
    return true;
  });

  // Initialize document class from saved preference
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

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <Shield className="h-5 w-5" /> },
    { href: "/inventory", label: "Inventory", icon: <Swords className="h-5 w-5" /> },
    { href: "/join-battle", label: "Join a Battle", icon: <Gamepad2 className="h-5 w-5" /> },
    { href: "/users", label: "Users", icon: <Users className="h-5 w-5" /> },
    { href: "/how-to-play", label: "How to Play", icon: <HelpCircle className="h-5 w-5" /> },
    { href: "/history", label: "History", icon: <History className="h-5 w-5" /> },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-slate-700 bg-[var(--header-bg)]"
    >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <img src="/assets/Logo.png" alt="Warfront Logo" className="h-10 sm:h-12 w-auto" />
          <span className="hidden font-bold sm:inline-block text-slate-200">Warfront</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="transition-colors hover:text-white text-slate-300 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme toggle button (desktop) */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="hidden md:inline-flex border-slate-600 text-slate-200 hover:bg-slate-800"
            aria-label="Change theme"
            title="Change theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <div className="hidden md:flex items-center gap-3">
            <NotificationBell />
            <UserButton />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-[var(--header-bg)]"
        >
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {/* Theme toggle (mobile) */}
            <Button
              variant="outline"
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="w-full border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              {isDark ? (
                <span className="flex items-center gap-2"><Sun className="h-4 w-4" /> Switch to Light</span>
              ) : (
                <span className="flex items-center gap-2"><Moon className="h-4 w-4" /> Switch to Dark</span>
              )}
            </Button>
            <div className="border-t border-slate-700 pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <NotificationBell />
                <UserButton />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}