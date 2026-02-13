import { Link, useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Package,
  Users,
  Settings,
  History,
  BookOpen,
  User,
  LogOut,
  Users2,
  Swords,
  Sun,
  Moon,
  Shield,
  Menu
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/join-battle", icon: Swords, label: "Join Battle" },
  { href: "/inventory", icon: Package, label: "Inventory" },
  { href: "/how-to-play", icon: BookOpen, label: "How to Play" },
  { href: "/friends", icon: Users, label: "Friends" },
  { href: "/history", icon: History, label: "History" },
  { href: "/users", icon: Users2, label: "Users" },
];

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

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

  // Check if user is admin
  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();
  const isAdmin =
    !!user &&
    (
      roleLc === "admin" ||
      roleLc === "owner" ||
      emailLc === "hardcorgamingstyle@gmail.com"
    );

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b border-slate-800 px-4 lg:h-[60px] lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src="/assets/Logo.png" alt="Warfront" className="h-8 w-8" />
          <span className="">Warfront</span>
        </Link>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="ml-auto border-slate-600 text-slate-200 hover:bg-slate-800"
          aria-label="Change theme"
          title="Change theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2 text-slate-300 transition-all hover:text-red-400 text-base sm:text-sm",
                location.pathname === item.href && "bg-slate-800 text-red-400",
              )}
            >
              <item.icon className="h-5 w-5 sm:h-4 sm:w-4" />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2 text-slate-300 transition-all hover:text-red-400 text-base sm:text-sm",
                location.pathname === "/admin" && "bg-slate-800 text-red-400",
              )}
            >
              <Shield className="h-5 w-5 sm:h-4 sm:w-4" />
              Admin Panel
            </Link>
          )}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-slate-800 flex items-center gap-4">
        <Link to="/profile">
          <User className="h-6 w-6 text-slate-300 hover:text-red-400" />
        </Link>
        <Link to="/settings">
          <Settings className="h-6 w-6 text-slate-300 hover:text-red-400" />
        </Link>
        <Button onClick={signOut} variant="ghost" size="icon" className="ml-auto">
          <LogOut className="h-6 w-6 text-slate-300 hover:text-red-400" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] text-white">
      <div className="hidden border-r border-slate-800 bg-[var(--header-bg)] md:block">
        <SidebarContent />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-slate-800 bg-[var(--header-bg)] px-4 lg:h-[60px] lg:px-6 md:hidden sticky top-0 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 md:hidden -ml-2 text-slate-300">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 bg-[var(--header-bg)] border-r-slate-800 text-white w-[280px]">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src="/assets/Logo.png" alt="Warfront" className="h-8 w-8" />
            <span className="">Warfront</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
             <NotificationBell />
          </div>
        </header>
        <div className="hidden md:flex h-14 items-center gap-4 border-b border-slate-800 bg-[var(--header-bg)] px-4 lg:h-[60px] lg:px-6 justify-end">
           <NotificationBell />
        </div>
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;