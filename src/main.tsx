import { Toaster } from "@/components/ui/sonner";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/layouts/ProtectedRoute";
import "./index.css";
import { cmsStore } from "@/pages/cms/cmsStore";

// Initialize theme globally before React mounts so all routes get correct background/colors
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const saved = localStorage.getItem("theme");
  const root = document.documentElement;
  if (saved === "light") {
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Lazy-loaded pages
const Landing = lazy(() => import("./pages/Landing.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Signup = lazy(() => import("./pages/Signup.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Inventory = lazy(() => import("./pages/Inventory.tsx"));
const JoinBattle = lazy(() => import("./pages/JoinBattle.tsx"));
const HowToPlay = lazy(() => import("./pages/HowToPlay.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const History = lazy(() => import("./pages/History.tsx"));
const TradeHistory = lazy(() => import("./pages/history/TradeHistory.tsx"));
const BattleHistory = lazy(() => import("./pages/history/BattleHistory.tsx"));
const Battle = lazy(() => import("./pages/Battle.tsx"));
const MultiBattle = lazy(() => import("./pages/MultiBattle.tsx"));
const Competitive = lazy(() => import("./pages/Competitive.tsx"));
const BattleRoom = lazy(() => import("./pages/BattleRoom.tsx"));
const Users = lazy(() => import("./pages/Users.tsx"));
const ProfileRedirect = lazy(() => import("./pages/ProfileRedirect.tsx"));
const AccountSettings = lazy(() => import("./pages/settings/Account.tsx"));
const SecuritySettings = lazy(() => import("./pages/settings/Security.tsx"));
const VisibilitySettings = lazy(() => import("./pages/settings/Visibility.tsx"));
const SocialMediaSettings = lazy(() => import("./pages/settings/SocialMedia.tsx"));
const Friends = lazy(() => import("./pages/Friends.tsx"));
const EmailVerified = lazy(() => import("./pages/EmailVerified.tsx"));
const CardsRedirect = lazy(() => import("./pages/CardsRedirect.tsx"));
const CardEditor = lazy(() => import("./pages/CardEditor.tsx"));
const CardViewer = lazy(() => import("./pages/CardViewer.tsx"));
const BlogList = lazy(() => import("./pages/BlogList.tsx"));
const BlogViewer = lazy(() => import("./pages/BlogViewer.tsx"));
const BlogEditor = lazy(() => import("./pages/BlogEditor.tsx"));
const AllCards = lazy(() => import("./pages/AllCards.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const AdminUsers = lazy(() => import("./pages/AdminUsers.tsx"));
const AdminCMS = lazy(() => import("./pages/AdminCMS.tsx"));
const AdminModeration = lazy(() => import("./pages/AdminModeration.tsx"));
const AdminCardInfo = lazy(() => import("./pages/AdminCardInfo.tsx"));

// Add new CMS page imports
const BlogsMain = lazy(() => import("./pages/cms/BlogsMain.tsx"));
const CardBlogs = lazy(() => import("./pages/cms/CardBlogs.tsx"));
const CompanyBlogs = lazy(() => import("./pages/cms/CompanyBlogs.tsx"));
const PagesUnsorted = lazy(() => import("./pages/cms/PagesUnsorted.tsx"));
const PagesPublic = lazy(() => import("./pages/cms/PagesPublic.tsx"));
const PagesPrivate = lazy(() => import("./pages/cms/PagesPrivate.tsx"));
const PagesCards = lazy(() => import("./pages/cms/PagesCards.tsx"));
const RobotPages = lazy(() => import("./pages/cms/RobotPages.tsx"));

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // NEW: Ensure current path exists in CMS store as an exact page entry
  useEffect(() => {
    const path = location.pathname || "/";
    cmsStore.ensure(path);
  }, [location.pathname]);

  return null;
}

const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-12 w-12 animate-spin " />
  </div>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Removed VlyToolbar to avoid DOM overlay interfering with React reconciliation */}
    {/* <VlyToolbar /> */}
    <InstrumentationProvider>
      <ConvexProvider client={convex}>
        <HelmetProvider>
          <BrowserRouter>
            <RouteSyncer />
            <Suspense fallback={<SuspenseFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="*" element={<NotFound />} />
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/how-to-play" element={<HowToPlay />} />
                <Route path="/cards" element={<CardsRedirect />} />
                <Route path="/cards/:cardId" element={<CardViewer />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogViewer />} />
                <Route path="/all-cards" element={<ProtectedRoute><AllCards /></ProtectedRoute>} />
                <Route path="/verify-email" element={<EmailVerified />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                <Route path="/join-battle" element={<ProtectedRoute><JoinBattle /></ProtectedRoute>} />
                <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfileRedirect /></ProtectedRoute>} />
                <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/settings/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                <Route path="/settings/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
                <Route path="/settings/visibility" element={<ProtectedRoute><VisibilitySettings /></ProtectedRoute>} />
                <Route path="/settings/socialmedia" element={<ProtectedRoute><SocialMediaSettings /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/trade-history" element={<ProtectedRoute><TradeHistory /></ProtectedRoute>} />
                <Route path="/battle-history" element={<ProtectedRoute><BattleHistory /></ProtectedRoute>} />
                <Route path="/battle/:battleId" element={<ProtectedRoute><BattleRoom /></ProtectedRoute>} />
                <Route path="/multi_battle" element={<ProtectedRoute><MultiBattle /></ProtectedRoute>} />
                <Route path="/competitive" element={<ProtectedRoute><Competitive /></ProtectedRoute>} />
                <Route path="/editor/card/:cardId" element={<ProtectedRoute><CardEditor /></ProtectedRoute>} />
                <Route path="/editor/blog/:blogId" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/cms" element={<ProtectedRoute><AdminCMS /></ProtectedRoute>} />
                <Route path="/admin/moderation" element={<ProtectedRoute><AdminModeration /></ProtectedRoute>} />
                <Route path="/admin/card-info" element={<ProtectedRoute><AdminCardInfo /></ProtectedRoute>} />
                
                {/* CMS Sub-routes */}
                <Route path="/admin/cms/blogs" element={<ProtectedRoute><BlogsMain /></ProtectedRoute>} />
                <Route path="/admin/cms/blogs/card-blogs" element={<ProtectedRoute><CardBlogs /></ProtectedRoute>} />
                <Route path="/admin/cms/blogs/company-blogs" element={<ProtectedRoute><CompanyBlogs /></ProtectedRoute>} />
                <Route path="/admin/cms/pages/unsorted" element={<ProtectedRoute><PagesUnsorted /></ProtectedRoute>} />
                <Route path="/admin/cms/pages/public" element={<ProtectedRoute><PagesPublic /></ProtectedRoute>} />
                <Route path="/admin/cms/pages/private" element={<ProtectedRoute><PagesPrivate /></ProtectedRoute>} />
                <Route path="/admin/cms/pages/cards" element={<ProtectedRoute><PagesCards /></ProtectedRoute>} />
                <Route path="/admin/cms/robot" element={<ProtectedRoute><RobotPages /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
        </HelmetProvider>
      </ConvexProvider>
    </InstrumentationProvider>
  </StrictMode>,
);