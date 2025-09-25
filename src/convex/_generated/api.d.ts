/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as allCards from "../allCards.js";
import type * as auth from "../auth.js";
import type * as auth_actions from "../auth_actions.js";
import type * as battles from "../battles.js";
import type * as blogs from "../blogs.js";
import type * as cardInfo from "../cardInfo.js";
import type * as cards from "../cards.js";
import type * as crons from "../crons.js";
import type * as dev from "../dev.js";
import type * as files from "../files.js";
import type * as friends from "../friends.js";
import type * as friendsActions from "../friendsActions.js";
import type * as generators_deleteAllUsers from "../generators/deleteAllUsers.js";
import type * as generators_deleteAllUsersAndAuthData from "../generators/deleteAllUsersAndAuthData.js";
import type * as generators_nuclearCleanup from "../generators/nuclearCleanup.js";
import type * as http from "../http.js";
import type * as multiplayerBattles from "../multiplayerBattles.js";
import type * as notifications from "../notifications.js";
import type * as seed from "../seed.js";
import type * as userActions from "../userActions.js";
import type * as userCards from "../userCards.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  allCards: typeof allCards;
  auth: typeof auth;
  auth_actions: typeof auth_actions;
  battles: typeof battles;
  blogs: typeof blogs;
  cardInfo: typeof cardInfo;
  cards: typeof cards;
  crons: typeof crons;
  dev: typeof dev;
  files: typeof files;
  friends: typeof friends;
  friendsActions: typeof friendsActions;
  "generators/deleteAllUsers": typeof generators_deleteAllUsers;
  "generators/deleteAllUsersAndAuthData": typeof generators_deleteAllUsersAndAuthData;
  "generators/nuclearCleanup": typeof generators_nuclearCleanup;
  http: typeof http;
  multiplayerBattles: typeof multiplayerBattles;
  notifications: typeof notifications;
  seed: typeof seed;
  userActions: typeof userActions;
  userCards: typeof userCards;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
