import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
  Settings,
  History,
  Sword,
  Shield,
  BookOpen,
  User,
  LogOut,
  Users2,
  Swords,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/join-battle", icon: Swords, label: "Join Battle" },
  { href: "/inventory", icon: Package, label: "Inventory" },
  { href: "/how-to-play", icon: BookOpen, label: "How to Play" },
  { href: "/history", icon: History, label: "History" },
  { href: "/users", icon: Users2, label: "Users" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-slate-950 text-white">
      <div className="hidden border-r border-slate-800 bg-slate-900/50 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-slate-800 px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <img src="/assets/Untitled_design.png" alt="Warfront" className="h-8 w-8" />
              <span className="">Warfront</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-red-400",
                    location.pathname === item.href && "bg-slate-800 text-red-400",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <Link to={`/profile/${user?._id}`}>
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
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-slate-800 bg-slate-900/50 px-4 lg:h-[60px] lg:px-6 md:hidden">
           <Link to="/" className="flex items-center gap-2 font-semibold">
              <img src="/assets/Untitled_design.png" alt="Warfront" className="h-8 w-8" />
              <span className="">Warfront</span>
            </Link>
            <div className="ml-auto flex items-center gap-4">
               <Link to={`/profile/${user?._id}`}>
                <User className="h-6 w-6 text-slate-300 hover:text-red-400" />
              </Link>
              <Link to="/settings">
                <Settings className="h-6 w-6 text-slate-300 hover:text-red-400" />
              </Link>
              <Button onClick={signOut} variant="ghost" size="icon">
                <LogOut className="h-6 w-6 text-slate-300 hover:text-red-400" />
              </Button>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}