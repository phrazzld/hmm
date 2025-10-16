import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Require authentication and return the user's ID.
 * Creates user record if it doesn't exist (only in mutations).
 *
 * @throws Error if user is not authenticated
 * @returns The user's Convex ID
 */
export async function requireAuth(
  ctx: MutationCtx
): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthenticated");
  }

  // Check if user exists
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (existingUser) {
    return existingUser._id;
  }

  // Create new user if doesn't exist
  const userId = await ctx.db.insert("users", {
    clerkId: identity.subject,
    email: identity.email ?? "",
    name: identity.name,
    createdAt: Date.now(),
  });

  return userId;
}

/**
 * Get the authenticated user's Clerk ID.
 * Useful in queries where we can't create the user.
 *
 * @throws Error if user is not authenticated
 * @returns The user's Clerk ID
 */
export async function requireAuthClerkId(
  ctx: { auth: { getUserIdentity: () => Promise<any> } }
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthenticated");
  }

  return identity.subject;
}
