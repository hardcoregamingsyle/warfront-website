import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CheckCheck, Inbox, Loader2 } from "lucide-react";

type NotificationDoc = {
  _id: string;
  _creationTime: number;
  userId: string;
  type: string;
  message: string;
  href?: string | null;
  read: boolean;
};

function parseTitleAndBody(message: string): { title: string; body: string } {
  // Support formats:
  // 1) **Title** — Message
  // 2) TITLE — Message
  // 3) Fallback: entire message as body
  const emDash = " — ";
  if (message.includes(emDash)) {
    const [rawTitle, ...rest] = message.split(emDash);
    const title = rawTitle.replace(/^\*\*(.+)\*\*$/, "$1").trim(); // strip **bold**
    const body = rest.join(emDash).trim();
    return { title, body };
  }
  // If there's no em dash, also try to strip **...**
  const boldMatch = message.match(/^\*\*(.+)\*\*\s*(.*)$/);
  if (boldMatch) {
    return { title: boldMatch[1].trim(), body: boldMatch[2].trim() };
  }
  // Fallback: no title delimiter
  return { title: "Notification", body: message };
}

export function NotificationBell() {
  const { token } = useAuth();
  const unread = useQuery(
    api.notifications.getUnread,
    token ? { token } : { token: undefined },
  ) as NotificationDoc[] | undefined;

  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const markAsRead = useMutation(api.notifications.markAsRead);

  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState<Record<string, boolean>>({});

  const count = useMemo(() => (unread ? unread.length : 0), [unread]);

  const handleMarkAll = async () => {
    if (!token || !count) return;
    try {
      setIsMarkingAll(true);
      await markAllAsRead({ token });
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      setMarkingIds((m) => ({ ...m, [id]: true }));
      await markAsRead({ notificationId: id as any });
    } finally {
      setMarkingIds((m) => {
        const { [id]: _, ...rest } = m;
        return rest;
      });
    }
  };

  const Badge = () =>
    count ? (
      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
        {count > 99 ? "99+" : count}
      </span>
    ) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="border-slate-600 text-slate-200 hover:bg-slate-800"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Badge />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 z-[9999]">
        <div className="px-2 py-2 flex items-center justify-between">
          <div className="font-semibold text-sm">Notifications</div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={!count || isMarkingAll}
            className="h-8"
          >
            {isMarkingAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </>
            )}
          </Button>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {unread === undefined ? (
            <div className="flex items-center justify-center py-6 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading...
            </div>
          ) : count === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Inbox className="h-6 w-6 mb-2" />
              <div className="text-sm">No new notifications</div>
            </div>
          ) : (
            unread.map((n) => {
              const { title, body } = parseTitleAndBody(n.message || "");
              return (
                <div key={n._id} className="px-2 py-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {body}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkOne(n._id)}
                      disabled={!!markingIds[n._id]}
                      className="h-8"
                    >
                      {markingIds[n._id] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        "Mark read"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
