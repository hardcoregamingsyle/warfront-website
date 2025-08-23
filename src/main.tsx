import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "@/components/VlyToolbar";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Lazy-loaded pages
const Landing = lazy(() => import("./pages/Landing.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Signup = lazy(() => import("./pages/Signup.tsx"));
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

  return null;
}

const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-12 w-12 animate-spin " />
  </div>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexProvider client={convex}>
        <HelmetProvider>
          <BrowserRouter>
            <RouteSyncer />
            <Suspense fallback={<SuspenseFallback />}>
              <Routes>
                <Route path="*" element={<NotFound />} />
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/join-battle" element={<JoinBattle />} />
                <Route path="/how-to-play" element={<HowToPlay />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/users" element={<Users />} />
                <Route path="/profile" element={<ProfileRedirect />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/account" element={<AccountSettings />} />
                <Route path="/settings/security" element={<SecuritySettings />} />
                <Route path="/settings/visibility" element={<VisibilitySettings />} />
                <Route path="/settings/socialmedia" element={<SocialMediaSettings />} />
                <Route path="/history" element={<History />} />
                <Route path="/trade-history" element={<TradeHistory />} />
                <Route path="/battle-history" element={<BattleHistory />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/email-verified" element={<EmailVerified />} />
                <Route path="/battle/:battleId" element={<BattleRoom />} />
                <Route path="/multi_battle" element={<MultiBattle />} />
                <Route path="/competitive" element={<Competitive />} />
                <Route path="/cards" element={<CardsRedirect />} />
                <Route path="/cards/:cardId" element={<CardViewer />} />
                <Route path="/editor/card/:cardId" element={<CardEditor />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogViewer />} />
                <Route path="/editor/blog/:blogId" element={<BlogEditor />} />
                <Route path="/all-cards" element={<AllCards />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
        </HelmetProvider>
      </ConvexProvider>
    </InstrumentationProvider>
  </StrictMode>,
);