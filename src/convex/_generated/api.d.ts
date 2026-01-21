/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as allCards from "../allCards.js";
import type * as auth from "../auth.js";
import type * as auth_actions from "../auth_actions.js";
import type * as battles from "../battles.js";
import type * as blogs from "../blogs.js";
import type * as cardInfo from "../cardInfo.js";
import type * as cards from "../cards.js";
import type * as cms from "../cms.js";
import type * as crons from "../crons.js";
import type * as dev from "../dev.js";
import type * as files from "../files.js";
import type * as friends from "../friends.js";
import type * as friendsActions from "../friendsActions.js";
import type * as generators_deleteAllUsers from "../generators/deleteAllUsers.js";
import type * as generators_deleteAllUsersAndAuthData from "../generators/deleteAllUsersAndAuthData.js";
import type * as generators_nuclearCleanup from "../generators/nuclearCleanup.js";
import type * as helpers_auth from "../helpers/auth.js";
import type * as http from "../http.js";
import type * as multiplayerBattles from "../multiplayerBattles.js";
import type * as packs from "../packs.js";
import type * as seed from "../seed.js";
import type * as seo from "../seo.js";
import type * as userActions from "../userActions.js";
import type * as userCards from "../userCards.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  allCards: typeof allCards;
  auth: typeof auth;
  auth_actions: typeof auth_actions;
  battles: typeof battles;
  blogs: typeof blogs;
  cardInfo: typeof cardInfo;
  cards: typeof cards;
  cms: typeof cms;
  crons: typeof crons;
  dev: typeof dev;
  files: typeof files;
  friends: typeof friends;
  friendsActions: typeof friendsActions;
  "generators/deleteAllUsers": typeof generators_deleteAllUsers;
  "generators/deleteAllUsersAndAuthData": typeof generators_deleteAllUsersAndAuthData;
  "generators/nuclearCleanup": typeof generators_nuclearCleanup;
  "helpers/auth": typeof helpers_auth;
  http: typeof http;
  multiplayerBattles: typeof multiplayerBattles;
  packs: typeof packs;
  seed: typeof seed;
  seo: typeof seo;
  userActions: typeof userActions;
  userCards: typeof userCards;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
