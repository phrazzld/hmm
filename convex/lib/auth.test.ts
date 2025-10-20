import { describe, it, expect } from "vitest";
import { requireAuth, requireAuthClerkId } from "./auth";
import { mockMutationCtx, mockQueryCtx } from "../test/utils";

describe("requireAuth", () => {
  it("should return userId for authenticated user with existing record", async () => {
    // Pre-create a user in the database
    const ctx = mockMutationCtx({
      userId: "clerk-user-123",
      email: "test@example.com",
      name: "Test User",
    });

    // Insert user into database
    const existingUserId = await ctx.db.insert("users", {
      clerkId: "clerk-user-123",
      email: "test@example.com",
      name: "Test User",
      createdAt: Date.now(),
    });

    // Call requireAuth - should return existing user
    const userId = await requireAuth(ctx);

    expect(userId).toBe(existingUserId);
    // Verify no duplicate user was created
    const allUsers = await ctx.db.query("users").collect();
    expect(allUsers).toHaveLength(1);
  });

  it("should create new user and return userId for authenticated user without record", async () => {
    const ctx = mockMutationCtx({
      userId: "clerk-new-user",
      email: "newuser@example.com",
      name: "New User",
    });

    // No existing user in database
    const userId = await requireAuth(ctx);

    // Verify user was created
    expect(userId).toBeDefined();
    const user = await ctx.db.get(userId);
    expect(user).toBeDefined();
    expect(user?.clerkId).toBe("clerk-new-user");
    expect(user?.email).toBe("newuser@example.com");
    expect(user?.name).toBe("New User");
    expect(user?.createdAt).toBeDefined();
  });

  it("should throw error for unauthenticated user", async () => {
    const ctx = mockMutationCtx({ authenticated: false });

    await expect(requireAuth(ctx)).rejects.toThrow("Unauthenticated");
  });

  it("should not create duplicate users on multiple calls", async () => {
    const ctx = mockMutationCtx({
      userId: "clerk-user-456",
      email: "test@example.com",
    });

    // First call - creates user
    const userId1 = await requireAuth(ctx);

    // Second call - should return same user
    const userId2 = await requireAuth(ctx);

    expect(userId1).toBe(userId2);

    // Verify only one user exists
    const allUsers = await ctx.db.query("users").collect();
    expect(allUsers).toHaveLength(1);
  });

  it("should handle missing email gracefully", async () => {
    // Create context where identity has no email (empty string)
    const ctx = mockMutationCtx({
      userId: "clerk-user-no-email",
      email: "", // Empty email in identity
      name: "No Email User",
    });

    const userId = await requireAuth(ctx);

    const user = await ctx.db.get(userId);
    expect(user?.email).toBe(""); // Empty string stored in database
  });
});

describe("requireAuthClerkId", () => {
  it("should return Clerk ID for authenticated user", async () => {
    const ctx = mockQueryCtx({
      userId: "clerk-query-user",
      email: "query@example.com",
    });

    const clerkId = await requireAuthClerkId(ctx);

    expect(clerkId).toBe("clerk-query-user");
  });

  it("should throw error for unauthenticated user", async () => {
    const ctx = mockQueryCtx({ authenticated: false });

    await expect(requireAuthClerkId(ctx)).rejects.toThrow("Unauthenticated");
  });

  it("should work with any context that has auth", async () => {
    // Test with mutation context (which also has auth)
    const mutationCtx = mockMutationCtx({
      userId: "clerk-mutation-user",
    });

    const clerkId = await requireAuthClerkId(mutationCtx);

    expect(clerkId).toBe("clerk-mutation-user");
  });
});
