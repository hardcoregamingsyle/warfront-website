import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup inactive multiplayer battles",
  { minutes: 5 }, // This will run every 5 minutes
  internal.multiplayerBattles.cleanupInactiveBattles
);

export default crons;
