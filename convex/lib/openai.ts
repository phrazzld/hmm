import OpenAI from "openai";

let openaiSingleton: OpenAI | null = null;

/**
 * Lazily instantiate the OpenAI client.
 * Ensures Convex deploys even if the env var is not present locally,
 * while still surfacing a helpful error at runtime.
 */
export function getOpenAIClient(): OpenAI {
  if (openaiSingleton) {
    return openaiSingleton;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured in the Convex environment. " +
        "Set it via `npx convex env set <deployment> OPENAI_API_KEY <value>`."
    );
  }

  openaiSingleton = new OpenAI({ apiKey });
  return openaiSingleton;
}

/**
 * Model configuration for embeddings.
 * Using text-embedding-3-small for optimal cost/performance.
 */
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;
