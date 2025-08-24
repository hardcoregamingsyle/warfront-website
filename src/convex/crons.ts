import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "delete old unverified users",
  "0 0 * * *", // Every day at midnight UTC
  internal.userActions.deleteUnverifiedUsers,
  {} // No args
);

export default crons;