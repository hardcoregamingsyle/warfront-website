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
import type * as auth_actions from "../auth_actions.js";
import type * as auth_resend from "../auth_resend.js";
import type * as generators_deleteAllUsers from "../generators/deleteAllUsers.js";
import type * as generators_deleteAllUsersAndAuthData from "../generators/deleteAllUsersAndAuthData.js";
import type * as generators_nuclearCleanup from "../generators/nuclearCleanup.js";
import type * as http from "../http.js";
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
  auth_actions: typeof auth_actions;
  auth_resend: typeof auth_resend;
  "generators/deleteAllUsers": typeof generators_deleteAllUsers;
  "generators/deleteAllUsersAndAuthData": typeof generators_deleteAllUsersAndAuthData;
  "generators/nuclearCleanup": typeof generators_nuclearCleanup;
  http: typeof http;
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
