import { describe, it, expect, beforeEach } from "vitest";
import { mockDb, mockAuth, mockScheduler, mockQueryCtx, mockMutationCtx } from "./utils";

describe("mockDb", () => {
  it("should insert and retrieve documents", async () => {
    const db = mockDb();

    const id = await db.insert("users", { name: "Test User", email: "test@example.com" });

    const doc = await db.get(id);
    expect(doc).toBeDefined();
    expect(doc.name).toBe("Test User");
    expect(doc.email).toBe("test@example.com");
    expect(doc._id).toBe(id);
  });

  it("should query documents", async () => {
    const db = mockDb();

    await db.insert("users", { name: "Alice", age: 30 });
    await db.insert("users", { name: "Bob", age: 25 });

    const results = await db.query("users").collect();
    expect(results).toHaveLength(2);
  });

  it("should filter by index", async () => {
    const db = mockDb();

    const userId1 = await db.insert("users", { clerkId: "user1" });
    await db.insert("users", { clerkId: "user2" });

    const result = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", "user1"))
      .unique();

    expect(result).toBeDefined();
    expect(result._id).toBe(userId1);
  });

  it("should patch documents", async () => {
    const db = mockDb();

    const id = await db.insert("users", { name: "Test", count: 0 });
    await db.patch(id, { count: 5 });

    const doc = await db.get(id);
    expect(doc.count).toBe(5);
  });

  it("should delete documents", async () => {
    const db = mockDb();

    const id = await db.insert("users", { name: "Test" });
    await db.delete(id);

    const doc = await db.get(id);
    expect(doc).toBeNull();
  });
});

describe("mockAuth", () => {
  it("should return authenticated user identity", async () => {
    const auth = mockAuth({
      userId: "test-123",
      email: "test@example.com",
      name: "Test User",
    });

    const identity = await auth.getUserIdentity();
    expect(identity).toBeDefined();
    expect(identity?.subject).toBe("test-123");
    expect(identity?.email).toBe("test@example.com");
    expect(identity?.name).toBe("Test User");
  });

  it("should return null when not authenticated", async () => {
    const auth = mockAuth({ authenticated: false });

    const identity = await auth.getUserIdentity();
    expect(identity).toBeNull();
  });
});

describe("mockScheduler", () => {
  it("should mock runAfter", async () => {
    const scheduler = mockScheduler();

    const result = await scheduler.runAfter(1000, { name: "testFunction" }, { arg: "value" });

    expect(result).toContain("scheduled");
    expect(scheduler.runAfter).toHaveBeenCalledWith(
      1000,
      { name: "testFunction" },
      { arg: "value" }
    );
  });
});

describe("mockQueryCtx", () => {
  it("should create a query context with db and auth", async () => {
    const ctx = mockQueryCtx({ userId: "test-user" });

    expect(ctx.db).toBeDefined();
    expect(ctx.auth).toBeDefined();

    const identity = await ctx.auth.getUserIdentity();
    expect(identity?.subject).toBe("test-user");
  });

  it("should pre-populate database if provided", async () => {
    const testData = new Map();
    testData.set("users:123", { _id: "users:123", name: "Alice" });

    const ctx = mockQueryCtx({ dbData: testData });

    const doc = await ctx.db.get("users:123" as any);
    expect(doc?.name).toBe("Alice");
  });
});

describe("mockMutationCtx", () => {
  it("should create a mutation context with all services", async () => {
    const ctx = mockMutationCtx({ userId: "test-user" });

    expect(ctx.db).toBeDefined();
    expect(ctx.auth).toBeDefined();
    expect(ctx.scheduler).toBeDefined();
    expect(ctx.storage).toBeDefined();
  });

  it("should support insert and query operations", async () => {
    const ctx = mockMutationCtx();

    const id = await ctx.db.insert("questions", {
      text: "Test question",
      userId: "user1",
    });

    const questions = await ctx.db.query("questions").collect();
    expect(questions).toHaveLength(1);
    expect(questions[0]._id).toBe(id);
  });
});
