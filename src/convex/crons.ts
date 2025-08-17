import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval(
//   "Clean up inactive multiplayer battles",
//   { minutes: 5 },
//   internal.multiplayerBattles.cleanupInactiveBattles,
// );

crons.interval(
  "Clean up inactive 1v1 battles",
  { minutes: 5 },
  internal.battles.cleanupInactiveBattles,
);

export default crons;