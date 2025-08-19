import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "@/components/VlyToolbar";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import Dashboard from "./pages/Dashboard.tsx";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Inventory from "./pages/Inventory.tsx";
import JoinBattle from "./pages/JoinBattle.tsx";
import HowToPlay from "./pages/HowToPlay.tsx";
import Profile from "./pages/Profile.tsx";
import Settings from "./pages/Settings.tsx";
import History from "./pages/History.tsx";
import TradeHistory from "./pages/history/TradeHistory.tsx";
import BattleHistory from "./pages/history/BattleHistory.tsx";
import Battle from "./pages/Battle.tsx";
import MultiBattle from "./pages/MultiBattle.tsx";
import Competitive from "./pages/Competitive.tsx";
import BattleRoom from "./pages/BattleRoom.tsx";
import Users from "./pages/Users.tsx";
import ProfileRedirect from "./pages/ProfileRedirect.tsx";
import AccountSettings from "./pages/settings/Account.tsx";
import SecuritySettings from "./pages/settings/Security.tsx";
import VisibilitySettings from "./pages/settings/Visibility.tsx";
import SocialMediaSettings from "./pages/settings/SocialMedia.tsx";
import Friends from "./pages/Friends.tsx";
import EmailVerified from "./pages/EmailVerified.tsx";
import CardsRedirect from "./pages/CardsRedirect.tsx";
import CardEditor from "./pages/CardEditor.tsx";
import CardViewer from "./pages/CardViewer.tsx";
import BlogList from "./pages/BlogList.tsx";
import BlogViewer from "./pages/BlogViewer.tsx";
import BlogEditor from "./pages/BlogEditor.tsx";
import AllCards from "./pages/AllCards.tsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexProvider client={convex}>
        <HelmetProvider>
          <BrowserRouter>
            <RouteSyncer />
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
          </BrowserRouter>
          <Toaster />
        </HelmetProvider>
      </ConvexProvider>
    </InstrumentationProvider>
  </StrictMode>,
);