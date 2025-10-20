import { describe, it, expect, beforeEach } from "vitest";
import { createQuestion } from "./questions";
import { mockMutationCtx } from "./test/utils";

describe("createQuestion", () => {
  it("should insert question with valid text and schedule embedding", async () => {
    const ctx = mockMutationCtx({
      userId: "test-user",
      email: "test@example.com",
    });

    // Pre-create user
    await ctx.db.insert("users", {
      clerkId: "test-user",
      email: "test@example.com",
      name: "Test User",
      createdAt: Date.now(),
    });

    const questionId = await createQuestion(ctx, { text: "What is the meaning of life?" });

    // Verify question was inserted
    expect(questionId).toBeDefined();
    const question = await ctx.db.get(questionId);
    expect(question).toBeDefined();
    expect(question?.text).toBe("What is the meaning of life?");
    expect(question?.userId).toBeDefined();

    // Verify scheduler was called to generate embedding
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      0,
      expect.anything(),
      expect.objectContaining({ questionId })
    );
  });

  it("should throw error for unauthenticated user", async () => {
    const ctx = mockMutationCtx({ authenticated: false });

    await expect(createQuestion(ctx, { text: "This should fail" })).rejects.toThrow(
      "Unauthenticated"
    );
  });

  it("should set userId correctly for the authenticated user", async () => {
    const ctx = mockMutationCtx({
      userId: "user-123",
      email: "user@example.com",
    });

    // Pre-create user
    const userId = await ctx.db.insert("users", {
      clerkId: "user-123",
      email: "user@example.com",
      name: "User 123",
      createdAt: Date.now(),
    });

    const questionId = await createQuestion(ctx, { text: "Test question" });

    const question = await ctx.db.get(questionId);
    expect(question?.userId).toBe(userId);
  });

  it("should auto-generate timestamps (createdAt and updatedAt)", async () => {
    const ctx = mockMutationCtx({
      userId: "test-user",
      email: "test@example.com",
    });

    // Pre-create user
    await ctx.db.insert("users", {
      clerkId: "test-user",
      email: "test@example.com",
      name: "Test User",
      createdAt: Date.now(),
    });

    const beforeCreate = Date.now();
    const questionId = await createQuestion(ctx, { text: "Timestamp test" });
    const afterCreate = Date.now();

    const question = await ctx.db.get(questionId);
    expect(question?.createdAt).toBeDefined();
    expect(question?.updatedAt).toBeDefined();

    // Timestamps should be within reasonable range
    expect(question?.createdAt).toBeGreaterThanOrEqual(beforeCreate);
    expect(question?.createdAt).toBeLessThanOrEqual(afterCreate);
    expect(question?.updatedAt).toBe(question?.createdAt);
  });

  it("should isolate questions by user", async () => {
    // Create two users
    const ctx1 = mockMutationCtx({
      userId: "user-1",
      email: "user1@example.com",
    });

    await ctx1.db.insert("users", {
      clerkId: "user-1",
      email: "user1@example.com",
      name: "User 1",
      createdAt: Date.now(),
    });

    const ctx2 = mockMutationCtx({
      userId: "user-2",
      email: "user2@example.com",
    });

    await ctx2.db.insert("users", {
      clerkId: "user-2",
      email: "user2@example.com",
      name: "User 2",
      createdAt: Date.now(),
    });

    // Create questions for each user
    const q1 = await createQuestion(ctx1, { text: "User 1 question" });
    const q2 = await createQuestion(ctx2, { text: "User 2 question" });

    // Verify questions are different and have different users
    expect(q1).not.toBe(q2);

    const question1 = await ctx1.db.get(q1);
    const question2 = await ctx2.db.get(q2);

    expect(question1?.userId).not.toBe(question2?.userId);
  });

  it("should create user on first question if doesn't exist", async () => {
    const ctx = mockMutationCtx({
      userId: "new-user",
      email: "new@example.com",
      name: "New User",
    });

    // No user in database yet
    const questionId = await createQuestion(ctx, { text: "First question" });

    // Verify question was created
    expect(questionId).toBeDefined();

    // Verify user was auto-created by requireAuth
    const users = await ctx.db.query("users").collect();
    expect(users).toHaveLength(1);
    expect(users[0].clerkId).toBe("new-user");
  });
});
