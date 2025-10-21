import { describe, it, expect } from "vitest";
import { createQuestion, getQuestions, getQuestion } from "./questions";
import { mockMutationCtx, mockQueryCtx } from "./test/utils";
import type { Id, Doc } from "./_generated/dataModel";

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

    // @ts-expect-error - Convex functions callable directly in tests
    const questionId = await createQuestion(ctx, { text: "What is the meaning of life?" });

    // Verify question was inserted
    expect(questionId).toBeDefined();
    const question = (await ctx.db.get(questionId)) as Doc<"questions"> | null;
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

    // @ts-expect-error - Convex functions callable directly in tests
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

    // @ts-expect-error - Convex functions callable directly in tests
    const questionId = await createQuestion(ctx, { text: "Test question" });

    const question = (await ctx.db.get(questionId)) as Doc<"questions"> | null;
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
    // @ts-expect-error - Convex functions callable directly in tests
    const questionId = await createQuestion(ctx, { text: "Timestamp test" });
    const afterCreate = Date.now();

    const question = (await ctx.db.get(questionId)) as Doc<"questions"> | null;
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
    // @ts-expect-error - Convex functions callable directly in tests
    const q1 = await createQuestion(ctx1, { text: "User 1 question" });
    // @ts-expect-error - Convex functions callable directly in tests
    const q2 = await createQuestion(ctx2, { text: "User 2 question" });

    // Verify questions are different and have different users
    expect(q1).not.toBe(q2);

    const question1 = (await ctx1.db.get(q1)) as Doc<"questions"> | null;
    const question2 = (await ctx2.db.get(q2)) as Doc<"questions"> | null;

    expect(question1?.userId).not.toBe(question2?.userId);
  });

  it("should create user on first question if doesn't exist", async () => {
    const ctx = mockMutationCtx({
      userId: "new-user",
      email: "new@example.com",
      name: "New User",
    });

    // No user in database yet
    // @ts-expect-error - Convex functions callable directly in tests
    const questionId = await createQuestion(ctx, { text: "First question" });

    // Verify question was created
    expect(questionId).toBeDefined();

    // Verify user was auto-created by requireAuth
    const users = await ctx.db.query("users").collect();
    expect(users).toHaveLength(1);
    expect(users[0]!.clerkId).toBe("new-user");
  });
});

describe("getQuestions", () => {
  it("should return only current user's questions", async () => {
    const ctx = mockQueryCtx({
      userId: "user-1",
      email: "user1@example.com",
    });

    // Create user 1
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    const user1Id = await ctx.db.insert("users", {
      clerkId: "user-1",
      email: "user1@example.com",
      name: "User 1",
      createdAt: Date.now(),
    });

    // Create user 2
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    const user2Id = await ctx.db.insert("users", {
      clerkId: "user-2",
      email: "user2@example.com",
      name: "User 2",
      createdAt: Date.now(),
    });

    // Create questions for user 1
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    await ctx.db.insert("questions", {
      userId: user1Id,
      text: "User 1 question 1",
      createdAt: Date.now() - 2000,
      updatedAt: Date.now() - 2000,
    });

    // @ts-expect-error - mockQueryCtx db has insert for test setup
    await ctx.db.insert("questions", {
      userId: user1Id,
      text: "User 1 question 2",
      createdAt: Date.now() - 1000,
      updatedAt: Date.now() - 1000,
    });

    // Create question for user 2 (should not be returned)
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    await ctx.db.insert("questions", {
      userId: user2Id,
      text: "User 2 question",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // @ts-expect-error - Convex functions callable directly in tests
    const result = await getQuestions(ctx, {
      paginationOpts: { numItems: 10, cursor: undefined },
    });

    // Should only return user 1's questions
    expect(result.page).toHaveLength(2);
    expect(result.page.every((q: any) => q.userId === user1Id)).toBe(true);
  });

  it("should return empty page for new user (no user record)", async () => {
    const ctx = mockQueryCtx({
      userId: "new-user",
      email: "new@example.com",
    });

    // @ts-expect-error - Convex functions callable directly in tests
    const result = await getQuestions(ctx, {
      paginationOpts: { numItems: 10, cursor: undefined },
    });

    expect(result.page).toEqual([]);
    expect(result.isDone).toBe(true);
    expect(result.continueCursor).toBe("");
  });

  it("should return empty page for unauthenticated user", async () => {
    const ctx = mockQueryCtx({ authenticated: false });

    // @ts-expect-error - Convex functions callable directly in tests
    const result = await getQuestions(ctx, {
      paginationOpts: { numItems: 10, cursor: undefined },
    });

    expect(result.page).toEqual([]);
    expect(result.isDone).toBe(true);
    expect(result.continueCursor).toBe("");
  });

  it("should order questions by createdAt desc (most recent first)", async () => {
    const ctx = mockQueryCtx({
      userId: "user-1",
      email: "user1@example.com",
    });

    // Create user
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    const userId = await ctx.db.insert("users", {
      clerkId: "user-1",
      email: "user1@example.com",
      name: "User 1",
      createdAt: Date.now(),
    });

    // Create questions with different timestamps
    const now = Date.now();
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    await ctx.db.insert("questions", {
      userId,
      text: "Oldest question",
      createdAt: now - 3000,
      updatedAt: now - 3000,
    });

    // @ts-expect-error - mockQueryCtx db has insert for test setup
    await ctx.db.insert("questions", {
      userId,
      text: "Middle question",
      createdAt: now - 2000,
      updatedAt: now - 2000,
    });

    // @ts-expect-error - mockQueryCtx db has insert for test setup
    await ctx.db.insert("questions", {
      userId,
      text: "Newest question",
      createdAt: now - 1000,
      updatedAt: now - 1000,
    });

    // @ts-expect-error - Convex functions callable directly in tests
    const result = await getQuestions(ctx, {
      paginationOpts: { numItems: 10, cursor: undefined },
    });

    expect(result.page).toHaveLength(3);
    expect(result.page[0].text).toBe("Newest question");
    expect(result.page[1].text).toBe("Middle question");
    expect(result.page[2].text).toBe("Oldest question");
  });

  it("should respect pagination limit", async () => {
    const ctx = mockQueryCtx({
      userId: "user-1",
      email: "user1@example.com",
    });

    // Create user
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    const userId = await ctx.db.insert("users", {
      clerkId: "user-1",
      email: "user1@example.com",
      name: "User 1",
      createdAt: Date.now(),
    });

    // Create 5 questions
    for (let i = 0; i < 5; i++) {
      // @ts-expect-error - mockQueryCtx db has insert for test setup
      await ctx.db.insert("questions", {
        userId,
        text: `Question ${i}`,
        createdAt: Date.now() - (5 - i) * 1000,
        updatedAt: Date.now() - (5 - i) * 1000,
      });
    }

    // Request only 2 questions
    // @ts-expect-error - Convex functions callable directly in tests
    const result = await getQuestions(ctx, {
      paginationOpts: { numItems: 2, cursor: undefined },
    });

    expect(result.page).toHaveLength(2);
    expect(result.isDone).toBe(false);
    expect(result.continueCursor).toBeTruthy();
  });
});

describe("getQuestion", () => {
  it("should return question with valid ID and ownership", async () => {
    const ctx = mockQueryCtx({
      userId: "user-1",
      email: "user1@example.com",
    });

    // Create user
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    const userId = await ctx.db.insert("users", {
      clerkId: "user-1",
      email: "user1@example.com",
      name: "User 1",
      createdAt: Date.now(),
    });

    // Create question
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    const questionId = await ctx.db.insert("questions", {
      userId,
      text: "Test question",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // @ts-expect-error - Convex functions callable directly in tests
    const question = await getQuestion(ctx, { questionId });

    expect(question).toBeDefined();
    expect(question.text).toBe("Test question");
    expect(question.userId).toBe(userId);
  });

  it("should throw error for question owned by different user", async () => {
    const ctx = mockQueryCtx({
      userId: "user-1",
      email: "user1@example.com",
    });

    // Create user 1
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    await ctx.db.insert("users", {
      clerkId: "user-1",
      email: "user1@example.com",
      name: "User 1",
      createdAt: Date.now(),
    });

    // Create user 2
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    const user2Id = await ctx.db.insert("users", {
      clerkId: "user-2",
      email: "user2@example.com",
      name: "User 2",
      createdAt: Date.now(),
    });

    // Create question owned by user 2
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    const questionId = await ctx.db.insert("questions", {
      userId: user2Id,
      text: "User 2's question",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // User 1 tries to access user 2's question
    // @ts-expect-error - Convex functions callable directly in tests
    await expect(getQuestion(ctx, { questionId })).rejects.toThrow(
      "Not authorized to access this question"
    );
  });

  it("should throw error for invalid question ID", async () => {
    const ctx = mockQueryCtx({
      userId: "user-1",
      email: "user1@example.com",
    });

    // Create user
    // @ts-expect-error - mockQueryCtx db has insert for test setup
    await ctx.db.insert("users", {
      clerkId: "user-1",
      email: "user1@example.com",
      name: "User 1",
      createdAt: Date.now(),
    });

    const fakeQuestionId = "questions:nonexistent" as Id<"questions">;

    // @ts-expect-error - Convex functions callable directly in tests
    await expect(getQuestion(ctx, { questionId: fakeQuestionId })).rejects.toThrow(
      "Question not found"
    );
  });

  it("should throw error for unauthenticated user", async () => {
    const ctx = mockQueryCtx({ authenticated: false });

    const fakeQuestionId = "questions:test" as Id<"questions">;

    // @ts-expect-error - Convex functions callable directly in tests
    await expect(getQuestion(ctx, { questionId: fakeQuestionId })).rejects.toThrow(
      "Unauthenticated"
    );
  });
});
