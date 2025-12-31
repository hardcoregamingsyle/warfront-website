import { Card } from "@/components/ui/card";
import { memo } from "react";

interface CardStatsProps {
    rarity?: string;
    frame?: string;
    batch?: string;
    numberingA?: number;
    numberingB?: number;
    signed?: string;
}

export const CardStats = memo(({ rarity, frame, batch, numberingA, numberingB, signed }: CardStatsProps) => {
    return (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <Card className="bg-slate-900 p-3">
                <p className="font-semibold text-slate-500">Rarity</p>
                <p className="text-slate-200">{rarity || "N/A"}</p>
            </Card>
            <Card className="bg-slate-900 p-3">
                <p className="font-semibold text-slate-500">Frame</p>
                <p className="text-slate-200">{frame || "N/A"}</p>
            </Card>
            <Card className="bg-slate-900 p-3">
                <p className="font-semibold text-slate-500">Batch</p>
                <p className="text-slate-200">{batch || "N/A"}</p>
            </Card>
            <Card className="bg-slate-900 p-3">
                <p className="font-semibold text-slate-500">Numbering</p>
                <p className="text-slate-200">{numberingA || 0}/{numberingB || 0}</p>
            </Card>
            <Card className="bg-slate-900 p-3 col-span-2">
                <p className="font-semibold text-slate-500">Signed</p>
                <p className="text-slate-200">{signed || "No"}</p>
            </Card>
        </div>
    );
});

CardStats.displayName = "CardStats";
