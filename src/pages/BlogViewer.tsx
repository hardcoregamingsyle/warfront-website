import DashboardLayout from "@/layouts/DashboardLayout";
import { useParams } from "react-router";

export default function BlogViewer() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-6">Briefing: {slug}</h1>
            <h2 className="text-2xl font-bold">Coming Soon</h2>
            <p className="text-slate-400">This mission briefing is currently being written. Check back later for the full details.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}