import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { openai, EMBEDDING_MODEL } from "../lib/openai";
import { withRetry } from "../lib/retry";

/**
 * Generate an embedding for a question.
 * Called from createQuestion mutation via scheduler.
 */
export const generateEmbedding = action({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    // Get the question text
    const question = await ctx.runQuery(internal.questions.getById, {
      questionId: args.questionId,
    });

    // Generate embedding with retry logic
    const embedding = await withRetry(async () => {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: question.text,
      });
      return response.data[0]?.embedding;
    });

    if (!embedding) {
      throw new Error("Failed to generate embedding");
    }

    // Store the embedding
    await ctx.runMutation(internal.embeddings.store, {
      questionId: args.questionId,
      embedding,
      model: EMBEDDING_MODEL,
    });
  },
});
