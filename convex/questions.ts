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
    await ctx.scheduler.runAfter(
      0,
      internal.actions.embeddings.generateEmbedding,
      { questionId }
    );

    return questionId;
  },
});

/**
 * Get all questions for the current user.
 * Returns most recent questions first.
 */
export const getQuestions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
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
