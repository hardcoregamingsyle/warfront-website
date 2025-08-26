import { Link, useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bell,
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
  Mail,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Id } from "@/convex/_generated/dataModel";
import { memo, useCallback } from "react";

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

const NotificationDropdown = memo(({ token }: { token: string | null }) => {
  const notifications = useQuery(
    api.notifications.getUnread,
    token ? { token } : "skip"
  );
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const navigate = useNavigate();

  const handleNotificationClick = useCallback(async (notification: { _id: Id<"notifications">, href: string }) => {
    await markAsRead({ notificationId: notification._id });
    navigate(notification.href);
  }, [markAsRead, navigate]);

  const handleMarkAllRead = useCallback(async () => {
    if (!token) return;
    await markAllAsRead({ token });
  }, [token, markAllAsRead]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6 text-slate-300 hover:text-red-400" />
          {notifications && notifications.length > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700 text-white">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notifications && notifications.length > 0 && (
            <Button variant="link" size="sm" onClick={handleMarkAllRead}>Mark all as read</Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        {notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <DropdownMenuItem key={n._id} onSelect={() => handleNotificationClick(n)} className="cursor-pointer hover:bg-slate-700">
              <Mail className="mr-2 h-4 w-4" />
              <span>{n.message}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-4 text-center text-sm text-slate-400">No new notifications</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut, token } = useAuth();
  const location = useLocation();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] text-white">
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
          <div className="mt-auto p-4 border-t border-slate-800 flex items-center gap-4">
            <NotificationDropdown token={token} />
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
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-slate-800 bg-slate-900/50 px-4 lg:h-[60px] lg:px-6 md:hidden">
           <Link to="/" className="flex items-center gap-2 font-semibold">
              <img src="/assets/Untitled_design.png" alt="Warfront" className="h-8 w-8" />
              <span className="">Warfront</span>
            </Link>
            <div className="ml-auto flex items-center gap-4">
              <NotificationDropdown token={token} />
              <Link to="/profile">
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

export default memo(DashboardLayout);