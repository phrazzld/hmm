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
import type * as actions_embeddings from "../actions/embeddings.js";
import type * as actions_search from "../actions/search.js";
import type * as embeddings from "../embeddings.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_openai from "../lib/openai.js";
import type * as lib_retry from "../lib/retry.js";
import type * as questions from "../questions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "actions/embeddings": typeof actions_embeddings;
  "actions/search": typeof actions_search;
  embeddings: typeof embeddings;
  "lib/auth": typeof lib_auth;
  "lib/openai": typeof lib_openai;
  "lib/retry": typeof lib_retry;
  questions: typeof questions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
