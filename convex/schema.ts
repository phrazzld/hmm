import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User accounts (managed by Clerk)
  users: defineTable({
    clerkId: v.string(), // Clerk user ID (stable identifier)
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(), // Unix timestamp
  }).index("by_clerk_id", ["clerkId"]),

  // Questions asked by users
  questions: defineTable({
    userId: v.id("users"),
    text: v.string(), // The question text
    createdAt: v.number(), // Unix timestamp
    updatedAt: v.number(), // Unix timestamp (for future edits)
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Vector embeddings for semantic search
  embeddings: defineTable({
    questionId: v.id("questions"),
    embedding: v.array(v.float64()), // 1536-dimensional vector (text-embedding-3-small)
    model: v.string(), // e.g., "text-embedding-3-small"
    createdAt: v.number(), // Unix timestamp
  })
    .index("by_question", ["questionId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["questionId"], // Enable filtering by question
    }),
});
