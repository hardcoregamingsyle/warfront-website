import Header from "@/components/layout/Header";
import { Protected } from "@/lib/protected-page";
import { Helmet } from "react-helmet-async";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Protected>
      <Helmet>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          {children}
        </main>
      </div>
    </Protected>
  );
}