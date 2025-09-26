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

// Enhanced escape + formatter to support custom markup
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatCustomMarkup(input: string): string {
  let s = escapeHtml(input);

  // Inline formats
  // Bold: *text*
  s = s.replace(/\*(?!\s)(.+?)(?<!\s)\*/g, "<strong>$1</strong>");
  
  // Italics: -text-
  s = s.replace(/-(?!\s)(.+?)(?<!\s)-/g, "<em>$1</em>");

  // Underline: _text_
  s = s.replace(/_(?!\s)(.+?)(?<!\s)_/g, "<u>$1</u>");

  // Strikethrough: ~text~
  s = s.replace(/~(?!\s)(.+?)(?<!\s)~/g, "<s>$1</s>");

  // Spoiler: `text`
  s = s.replace(
    /`(?!\s)(.+?)(?<!\s)`/g,
    '<span class="blur-[2px] hover:blur-0 bg-slate-700/60 px-1 rounded transition-all duration-200 cursor-pointer">$1</span>',
  );

  // Link: /text/ (assume text is URL; if not, still link to it via https)
  s = s.replace(/\/(?!\s)(.+?)(?<!\s)\//g, (_m, p1: string) => {
    const url =
      p1.startsWith("http://") || p1.startsWith("https://")
        ? p1
        : `https://${p1}`;
    const safeText = escapeHtml(p1);
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-red-500 underline hover:text-red-400 transition-colors">${safeText}</a>`;
  });

  // Convert lines to lists/paragraphs
  const lines = s.split(/\r?\n/);
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    // Ordered list: "1. item"
    if (/^\d+\.\s+/.test(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, "").trim());
        i++;
      }
      blocks.push(
        `<ol class="list-decimal ml-6 space-y-1 my-2">${items
          .map((li) => `<li class="text-slate-300">${li}</li>`)
          .join("")}</ol>`,
      );
      continue;
    }

    // Unordered list: "- item"
    if (/^-\s+/.test(lines[i])) {
      const items: string[] = [];
      while (i < lines.length && /^-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^-+\s+/, "").trim());
        i++;
      }
      blocks.push(
        `<ul class="list-disc ml-6 space-y-1 my-2">${items
          .map((li) => `<li class="text-slate-300">${li}</li>`)
          .join("")}</ul>`,
      );
      continue;
    }

    // Preserve blank lines as line breaks
    if (lines[i].trim() === "") {
      blocks.push("<br/>");
      i++;
      continue;
    }

    // Regular paragraph
    blocks.push(`<p class="text-slate-300 mb-2">${lines[i]}</p>`);
    i++;
  }

  return blocks.join("");
}

function parseTitleAndBody(message: string): { title: string; body: string } {
  // Enhanced parsing to handle different title formats
  const emDash = " — ";
  
  // Check for "**Title** — Message" format
  if (message.includes(emDash)) {
    const [rawTitle, ...rest] = message.split(emDash);
    const title = rawTitle.replace(/^\*\*(.+)\*\*$/, "$1").trim();
    const body = rest.join(emDash).trim();
    return { title, body };
  }
  
  // Check for "**Title** Message" format (bold title at start)
  const boldMatch = message.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  if (boldMatch) {
    return { title: boldMatch[1].trim(), body: boldMatch[2].trim() };
  }
  
  // Check for simple "Title — Message" format
  if (message.includes(" — ")) {
    const [title, ...rest] = message.split(" — ");
    return { title: title.trim(), body: rest.join(" — ").trim() };
  }
  
  // Fallback: treat entire message as body with generic title
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
      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-medium">
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
            className="border-slate-600 text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Badge />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 z-[9999] max-h-[500px]">
        <div className="px-3 py-3 flex items-center justify-between border-b">
          <div className="font-semibold text-sm">Notifications</div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={!count || isMarkingAll}
            className="h-8 text-xs"
          >
            {isMarkingAll ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </>
            )}
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {unread === undefined ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading notifications...
            </div>
          ) : count === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Inbox className="h-8 w-8 mb-3 opacity-50" />
              <div className="text-sm font-medium">No new notifications</div>
              <div className="text-xs text-slate-500 mt-1">You're all caught up!</div>
            </div>
          ) : (
            unread.map((n) => {
              const { title, body } = parseTitleAndBody(n.message || "");
              const formattedBody = formatCustomMarkup(body || "");
              return (
                <div key={n._id} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                  <div className="px-3 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title in bold on its own line */}
                        <div className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                          {title || "Notification"}
                        </div>
                        {/* Content with rich formatting */}
                        {formattedBody && (
                          <div
                            className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: formattedBody }}
                          />
                        )}
                        {/* Timestamp */}
                        <div className="text-xs text-slate-400 mt-2">
                          {new Date(n._creationTime).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkOne(n._id)}
                        disabled={!!markingIds[n._id]}
                        className="h-7 px-2 text-xs shrink-0"
                      >
                        {markingIds[n._id] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Mark read"
                        )}
                      </Button>
                    </div>
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