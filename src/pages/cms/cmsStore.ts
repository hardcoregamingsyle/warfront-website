// Simple in-memory CMS store for page categorization across CMS subpages.
// This avoids backend work and supports instant, cross-page updates.

export type CmsCategory = "unsorted" | "public" | "private" | "cards" | "robot";

export type CmsPage = {
  path: string;
  title: string;
  category: CmsCategory;
};

// A comprehensive initial list of routes, derived from src/main.tsx.
// Add or adjust titles minimally; all start "unsorted".
const initialPages: Array<CmsPage> = [
  // Public
  { path: "/", title: "Landing", category: "unsorted" },
  { path: "/login", title: "Login", category: "unsorted" },
  { path: "/signup", title: "Signup", category: "unsorted" },
  { path: "/forgot-password", title: "Forgot Password", category: "unsorted" },
  { path: "/reset-password", title: "Reset Password", category: "unsorted" },
  { path: "/how-to-play", title: "How To Play", category: "unsorted" },
  { path: "/cards", title: "Cards Redirect", category: "unsorted" },
  { path: "/cards/:cardId", title: "Card Viewer", category: "unsorted" },
  { path: "/blog", title: "Blog List", category: "unsorted" },
  { path: "/blog/:slug", title: "Blog Viewer", category: "unsorted" },
  { path: "/verify-email", title: "Email Verified", category: "unsorted" },
  { path: "/all-cards", title: "All Cards (Protected)", category: "unsorted" },

  // Protected core
  { path: "/dashboard", title: "Dashboard", category: "unsorted" },
  { path: "/inventory", title: "Inventory", category: "unsorted" },
  { path: "/join-battle", title: "Join Battle", category: "unsorted" },
  { path: "/friends", title: "Friends", category: "unsorted" },
  { path: "/users", title: "Users", category: "unsorted" },
  { path: "/profile", title: "Profile Redirect", category: "unsorted" },
  { path: "/profile/:userId", title: "Profile", category: "unsorted" },
  { path: "/settings", title: "Settings", category: "unsorted" },
  { path: "/settings/account", title: "Account Settings", category: "unsorted" },
  { path: "/settings/security", title: "Security Settings", category: "unsorted" },
  { path: "/settings/visibility", title: "Visibility Settings", category: "unsorted" },
  { path: "/settings/socialmedia", title: "Social Media Settings", category: "unsorted" },
  { path: "/history", title: "History", category: "unsorted" },
  { path: "/trade-history", title: "Trade History", category: "unsorted" },
  { path: "/battle-history", title: "Battle History", category: "unsorted" },
  { path: "/battle/:battleId", title: "Battle Room", category: "unsorted" },
  { path: "/multi_battle", title: "Multi Battle", category: "unsorted" },
  { path: "/competitive", title: "Competitive", category: "unsorted" },

  // Editors
  { path: "/editor/card/:cardId", title: "Card Editor", category: "unsorted" },
  { path: "/editor/blog/:blogId", title: "Blog Editor", category: "unsorted" },

  // Admin
  { path: "/admin", title: "Admin", category: "unsorted" },
  { path: "/admin/users", title: "Admin Users", category: "unsorted" },
  { path: "/admin/cms", title: "Admin CMS", category: "unsorted" },
  { path: "/admin/moderation", title: "Admin Moderation", category: "unsorted" },
  { path: "/admin/card-info", title: "Admin Card Info", category: "unsorted" },

  // CMS sub-routes
  { path: "/admin/cms/blogs", title: "CMS Blogs Main", category: "unsorted" },
  { path: "/admin/cms/blogs/card-blogs", title: "Card Blogs", category: "unsorted" },
  { path: "/admin/cms/blogs/company-blogs", title: "Company Blogs", category: "unsorted" },

  // New CMS pages categories to view results
  { path: "/admin/cms/pages/public", title: "Public Pages", category: "unsorted" },
  { path: "/admin/cms/pages/private", title: "Private Pages", category: "unsorted" },
  { path: "/admin/cms/pages/unsorted", title: "Unsorted Pages", category: "unsorted" },
  { path: "/admin/cms/pages/cards", title: "Card Pages", category: "unsorted" },
  { path: "/admin/cms/robot", title: "Robot Pages", category: "unsorted" },

  // NotFound is handled by wildcard, not a direct route path entry
];

type Listener = () => void;

class CmsStore {
  private pages: Array<CmsPage> = [...initialPages];
  private listeners: Set<Listener> = new Set();

  getAll(): Array<CmsPage> {
    return this.pages;
  }

  getByCategory(category: CmsCategory): Array<CmsPage> {
    return this.pages.filter((p) => p.category === category);
  }

  move(path: string, to: CmsCategory) {
    let changed = false;
    this.pages = this.pages.map((p) => {
      if (p.path === path) {
        changed = true;
        return { ...p, category: to };
      }
      return p;
    });
    if (changed) this.emit();
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn();
  }
}

export const cmsStore = new CmsStore();
