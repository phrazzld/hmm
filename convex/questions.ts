import { mutation, query, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

/**
 * Create a new question.
 * Schedules embedding generation in the background.
 */
export const createQuestion = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();

    // Insert question
    const questionId = await ctx.db.insert("questions", {
      userId,
      text: args.text,
      createdAt: now,
      updatedAt: now,
    });

    // Schedule embedding generation (non-blocking)
    // FIXME: Type assertion workaround for nested action directories
    // Convex hasn't regenerated types for actions/* yet, so we use `as any` to access
    // the nested module. This is safe at runtime but bypasses TypeScript checking.
    // Will be resolved automatically when Convex regenerates types after next deploy.
    await ctx.scheduler.runAfter(
      0,
      (internal as any)["actions/embeddings"].generateEmbedding,
      { questionId }
    );

    return questionId;
  },
});

/**
 * Get all questions for the current user.
 * Returns most recent questions first.
 * Returns empty array if user is not authenticated.
 */
export const getQuestions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    // Return empty array instead of throwing - allows graceful degradation
    // UI should use <Authenticated> guards, but this prevents errors during auth transitions
    if (!identity) {
      return [];
    }

    // Find user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // User hasn't created any questions yet (no user record)
      return [];
    }

    const limit = args.limit ?? 50;

    return await ctx.db
      .query("questions")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});

/**
 * Get a single question by ID.
 * Verifies ownership before returning.
 */
export const getQuestion = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const question = await ctx.db.get(args.questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    // Find user to verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || question.userId !== user._id) {
      throw new Error("Not authorized to access this question");
    }

    return question;
  },
});

/**
 * Get a question by ID (internal only).
 * No auth check - for use in actions.
 */
export const getById = internalQuery({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }
    return question;
  },
});

/**
 * Hydrate search results with question data (internal only).
 * Filters by current user for security.
 */
export const hydrateSearchResults = internalQuery({
  args: {
    embeddingIds: v.array(v.id("embeddings")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get embeddings and their questions
    const results = [];
    for (const embeddingId of args.embeddingIds) {
      const embedding = await ctx.db.get(embeddingId);
      if (!embedding) continue;

      const question = await ctx.db.get(embedding.questionId);
      if (!question) continue;

      // Only return questions owned by the current user
      if (question.userId === user._id) {
        results.push({
          question,
          // Note: similarity score comes from vector search but isn't available here
          // Could be passed through embeddingIds if needed
        });
      }
    }

    return results;
  },
});
