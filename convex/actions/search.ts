"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { getOpenAIClient, EMBEDDING_MODEL } from "../lib/openai";
import { withRetry } from "../lib/retry";
import type { Doc, Id } from "../_generated/dataModel";

/**
 * Search questions semantically using natural language.
 * Returns questions ranked by semantic similarity to the query.
 */
export const semanticSearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args
  ): Promise<Array<{ question: Doc<"questions">; score: number }>> => {
    const limit = args.limit ?? 20;

    // Generate embedding for the search query
    const openai = getOpenAIClient();
    const queryEmbedding = await withRetry(async () => {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: args.query,
      });
      return response.data[0]?.embedding;
    });

    if (!queryEmbedding) {
      throw new Error("Failed to generate query embedding");
    }

    // Perform vector search on embeddings
    // Note: vectorSearch returns results with _score (similarity)
    const results: Array<{ _id: Id<"embeddings">; _score: number }> =
      await ctx.vectorSearch("embeddings", "by_embedding", {
        vector: queryEmbedding,
        limit,
      });

    // Create score map for hydration
    const scoreMap = new Map(
      results.map((r) => [r._id.toString(), r._score])
    );

    // Hydrate questions and filter by user
    const searchResults: Array<{ question: Doc<"questions">; score: number }> =
      await ctx.runQuery(internal.questions.hydrateSearchResults, {
        embeddingIds: results.map((r) => r._id),
        scoreMap: Object.fromEntries(scoreMap),
      });

    return searchResults;
  },
});

/**
 * Get questions related to a specific question.
 * Uses the question's embedding to find similar questions.
 */
export const getRelatedQuestions = action({
  args: {
    questionId: v.id("questions"),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args
  ): Promise<Array<{ question: Doc<"questions">; score: number }>> => {
    const limit = args.limit ?? 5;

    // Get the embedding for this question
    const embedding: Doc<"embeddings"> | null = await ctx.runQuery(
      internal.embeddings.getByQuestion,
      {
        questionId: args.questionId,
      }
    );

    if (!embedding) {
      // Question doesn't have an embedding yet
      return [];
    }

    // Search for similar questions (get extra to account for filtering self)
    const results: Array<{ _id: Id<"embeddings">; _score: number }> =
      await ctx.vectorSearch("embeddings", "by_embedding", {
        vector: embedding.embedding,
        limit: limit + 1, // +1 to account for self
      });

    // Filter out the current question and keep scores
    const filteredResults = results
      .filter((r) => r._id !== embedding._id)
      .slice(0, limit);

    // Create score map for hydration
    const scoreMap = new Map(
      filteredResults.map((r) => [r._id.toString(), r._score])
    );

    // Hydrate and filter by user
    const relatedQuestions: Array<{ question: Doc<"questions">; score: number }> =
      await ctx.runQuery(internal.questions.hydrateSearchResults, {
        embeddingIds: filteredResults.map((r) => r._id),
        scoreMap: Object.fromEntries(scoreMap),
      });

    return relatedQuestions;
  },
});
