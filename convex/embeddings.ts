import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Store an embedding for a question (internal only).
 * Called from actions after generating embeddings.
 */
export const store = internalMutation({
  args: {
    questionId: v.id("questions"),
    embedding: v.array(v.float64()),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("embeddings", {
      questionId: args.questionId,
      embedding: args.embedding,
      model: args.model,
      createdAt: Date.now(),
    });
  },
});

/**
 * Get the embedding for a question (internal only).
 */
export const getByQuestion = internalQuery({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("embeddings")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .unique();
  },
});
