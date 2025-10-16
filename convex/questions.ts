import { mutation } from "./_generated/server";
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
    // TODO: Implement generateEmbedding action
    // await ctx.scheduler.runAfter(0, internal.actions.generateEmbedding, { questionId });

    return questionId;
  },
});
