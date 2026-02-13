import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/UserButton";
import { motion } from "framer-motion";
import { Swords, Shield, Gamepad2, HelpCircle, Menu, Users, History, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default function Header() {
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
      <div className="container flex h-14 sm:h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-slate-300 hover:text-white -ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-[var(--header-bg)] border-r-slate-800 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 p-6 border-b border-slate-800">
                  <img src="/assets/Logo.png" alt="Warfront Logo" className="h-8 w-8" />
                  <span className="font-bold text-slate-200">Warfront</span>
                </div>
                <nav className="flex-1 overflow-auto py-4 px-4 space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white text-base"
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-slate-800 space-y-4">
                  <Button
                    variant="outline"
                    onClick={toggleTheme}
                    className="w-full justify-start gap-2 border-slate-600 text-slate-200 hover:bg-slate-800 h-12"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </Button>
                  <div className="flex items-center gap-2">
                    <UserButton />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center space-x-2">
            <img src="/assets/Logo.png" alt="Warfront Logo" className="h-8 sm:h-10 md:h-12 w-auto" />
            <span className="hidden font-bold sm:inline-block text-slate-200">Warfront</span>
          </Link>
        </div>

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

        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationBell />
          
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
            <UserButton />
          </div>
        </div>
      </div>
    </motion.header>
  );
}