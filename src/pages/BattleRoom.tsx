import DashboardLayout from "@/layouts/DashboardLayout";
import { useParams } from "react-router";

export default function BattleRoom() {
  const { battleId } = useParams();

  return (
    <DashboardLayout>
      <div className="container mx-auto text-center py-12">
        <h1 className="text-5xl font-bold text-red-500">Battle Room</h1>
        <p className="text-xl text-slate-300 mt-4">Battle ID: {battleId}</p>
        <div className="mt-12 p-8 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-3xl text-green-400 animate-pulse">The battle will begin shortly...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
