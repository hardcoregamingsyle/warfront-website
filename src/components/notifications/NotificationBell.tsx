import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export function NotificationBell() {
  const notifications = useQuery(api.notifications.get);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const [open, setOpen] = useState(false);
  const [lastCount, setLastCount] = useState(0);
  const navigate = useNavigate();

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  // Effect to handle push/toast notifications
  useEffect(() => {
    if (notifications) {
      const currentCount = notifications.length;
      // If we have more notifications than before, show a toast for the newest one
      if (currentCount > lastCount && lastCount !== 0) {
        const newest = notifications[0];
        if (newest && !newest.read) {
          // Web Notification API
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Warfront", {
              body: newest.message,
              icon: "/logo.png"
            });
          }
          
          // In-app toast
          toast(newest.message, {
            action: {
              label: "View",
              onClick: () => {
                if (newest.href) navigate(newest.href);
                markAsRead({ notificationId: newest._id });
              }
            }
          });
        }
      }
      setLastCount(currentCount);
    }
  }, [notifications, lastCount, navigate, markAsRead]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead({ notificationId: notification._id });
    }
    if (notification.href) {
      setOpen(false);
      navigate(notification.href);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-auto py-1"
              onClick={() => markAllAsRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications?.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="grid gap-1">
              {notifications?.map((notification) => (
                <button
                  key={notification._id}
                  className={cn(
                    "flex flex-col items-start gap-1 p-4 text-left text-sm transition-colors hover:bg-muted/50",
                    !notification.read && "bg-muted/20 border-l-2 border-red-500"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="font-medium">{notification.type}</div>
                  <div className="text-muted-foreground line-clamp-2">
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(notification._creationTime).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}