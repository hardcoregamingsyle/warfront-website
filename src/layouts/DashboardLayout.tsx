import Header from "@/components/layout/Header";
import { Protected } from "@/lib/protected-page";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Protected>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          {children}
        </main>
      </div>
    </Protected>
  );
}
