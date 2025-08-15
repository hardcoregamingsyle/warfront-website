import DashboardLayout from "@/layouts/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

// Placeholder data for battles
const battles = [
  {
    id: 1,
    host: {
      username: "Sgt. Slaughter",
      pfp: "https://github.com/shadcn.png", // Placeholder image
    },
    opponent: {
      username: "General Mayhem",
      pfp: "https://github.com/shadcn.png", // Placeholder image
    },
    status: "Full",
  },
  {
    id: 2,
    host: {
      username: "Commander Blade",
      pfp: "https://github.com/shadcn.png",
    },
    opponent: null,
    status: "Open",
  },
  {
    id: 3,
    host: {
      username: "Major Payne",
      pfp: "https://github.com/shadcn.png",
    },
    opponent: null,
    status: "Open",
  },
  {
    id: 4,
    host: {
      username: "Captain Chaos",
      pfp: "https://github.com/shadcn.png",
    },
    opponent: {
      username: "Colonel Crush",
      pfp: "https://github.com/shadcn.png",
    },
    status: "Full",
  },
  {
    id: 5,
    host: {
      username: "Private Parts",
      pfp: "https://github.com/shadcn.png",
    },
    opponent: null,
    status: "Open",
  },
];

export default function Battle() {
  return (
    <DashboardLayout>
      <div className="bg-slate-900 text-white -m-8 p-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold tracking-tight text-red-500">
              Quick Battle
            </h1>
            <p className="text-xl text-slate-300 mt-4 max-w-2xl mx-auto">
              Choose your opponent and enter the fray. Victory awaits the bold.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {battles.map((battle, index) => (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-slate-800 border border-slate-700 hover:border-red-500/50 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 w-1/3">
                      <Avatar>
                        <AvatarImage src={battle.host.pfp} alt={battle.host.username} />
                        <AvatarFallback>{battle.host.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-slate-200">{battle.host.username}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 text-2xl font-thin">VS</span>
                    </div>

                    <div className="flex items-center gap-4 w-1/3 justify-center">
                      {battle.opponent ? (
                        <>
                          <Avatar>
                            <AvatarImage src={battle.opponent.pfp} alt={battle.opponent.username} />
                            <AvatarFallback>{battle.opponent.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-slate-200">{battle.opponent.username}</span>
                        </>
                      ) : (
                        <span className="text-green-400 font-bold">Waiting for Opponent...</span>
                      )}
                    </div>
                    
                    <div className="w-1/4 text-right">
                      {battle.status === "Open" ? (
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          Join Battle
                        </Button>
                      ) : (
                        <Button variant="destructive" disabled>
                          Full
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}