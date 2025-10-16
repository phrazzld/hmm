import OpenAI from "openai";

/**
 * Singleton OpenAI client.
 * Configured with API key from Convex environment variables.
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Model configuration for embeddings.
 * Using text-embedding-3-small for optimal cost/performance.
 */
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;
