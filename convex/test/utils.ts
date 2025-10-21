/**
 * Test utilities for mocking Convex context objects.
 * Enables testing of queries, mutations, and actions.
 */

import { vi } from "vitest";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Mock database for testing.
 * Provides simple in-memory storage for testing queries and mutations.
 */
export function mockDb() {
  const storage = new Map<string, any>();

  return {
    get: vi.fn(async (id: Id<any>) => {
      return storage.get(id) || null;
    }),

    insert: vi.fn(async (table: string, document: any) => {
      const id = `${table}:${Math.random().toString(36).substr(2, 9)}` as Id<any>;
      const doc = { ...document, _id: id, _creationTime: Date.now() };
      storage.set(id, doc);
      return id;
    }),

    patch: vi.fn(async (id: Id<any>, fields: any) => {
      const doc = storage.get(id);
      if (!doc) throw new Error(`Document ${id} not found`);
      Object.assign(doc, fields);
    }),

    delete: vi.fn(async (id: Id<any>) => {
      storage.delete(id);
    }),

    query: vi.fn((table: string) => {
      const results: any[] = [];

      // Collect all documents from this table
      for (const [id, doc] of storage.entries()) {
        if (id.startsWith(`${table}:`)) {
          results.push(doc);
        }
      }

      return {
        withIndex: vi.fn((_indexName: string, filterFn?: (q: any) => any) => {
          // Simple filter implementation for testing
          let filtered = results;

          if (filterFn) {
            // Mock query builder for .eq() filters
            const mockQuery = {
              eq: vi.fn((field: string, value: any) => {
                filtered = filtered.filter((doc) => doc[field] === value);
                return mockQuery;
              }),
            };
            filterFn(mockQuery);
          }

          return {
            order: vi.fn((direction?: "asc" | "desc") => ({
              take: vi.fn(async (limit: number) => {
                const sorted =
                  direction === "desc"
                    ? filtered.sort((a, b) => b._creationTime - a._creationTime)
                    : filtered.sort((a, b) => a._creationTime - b._creationTime);
                return sorted.slice(0, limit);
              }),
              collect: vi.fn(async () => {
                return direction === "desc"
                  ? filtered.sort((a, b) => b._creationTime - a._creationTime)
                  : filtered.sort((a, b) => a._creationTime - b._creationTime);
              }),
              paginate: vi.fn(async (opts: { numItems: number; cursor?: string }) => {
                const sorted =
                  direction === "desc"
                    ? filtered.sort((a, b) => b.createdAt - a.createdAt)
                    : filtered.sort((a, b) => a.createdAt - b.createdAt);

                const startIndex = opts.cursor ? parseInt(opts.cursor, 10) : 0;
                const endIndex = startIndex + opts.numItems;
                const page = sorted.slice(startIndex, endIndex);
                const isDone = endIndex >= sorted.length;
                const continueCursor = isDone ? "" : endIndex.toString();

                return {
                  page,
                  isDone,
                  continueCursor,
                };
              }),
            })),
            unique: vi.fn(async () => filtered[0] || null),
            collect: vi.fn(async () => filtered),
            take: vi.fn(async (limit: number) => filtered.slice(0, limit)),
          };
        }),
        filter: vi.fn((filterFn: (q: any) => any) => ({
          collect: vi.fn(async () => results.filter(filterFn)),
        })),
        collect: vi.fn(async () => results),
      };
    }),

    // Expose storage for test setup
    _storage: storage,
    _clear: () => storage.clear(),
  };
}

/**
 * Mock auth context for testing.
 * Returns a getUserIdentity function that can be configured.
 */
export function mockAuth(options?: {
  userId?: string;
  email?: string;
  name?: string;
  authenticated?: boolean;
}) {
  const authenticated = options?.authenticated ?? true;

  return {
    getUserIdentity: vi.fn(async () => {
      if (!authenticated) return null;

      return {
        subject: options?.userId || "test-user-id",
        email: options?.email !== undefined ? options.email : "test@example.com",
        name: options?.name || "Test User",
      };
    }),
  };
}

/**
 * Mock scheduler for testing mutation scheduling.
 */
export function mockScheduler() {
  return {
    runAfter: vi.fn(async (_delayMs: number, _functionReference: any, _args: any) => {
      // In tests, we just record that scheduling was called
      // Don't try to access properties on functionReference as it may be a complex object
      return `scheduled:${Date.now()}`;
    }),
    runAt: vi.fn(async (_timestamp: number, _functionReference: any, _args: any) => {
      return `scheduled:${Date.now()}`;
    }),
  };
}

/**
 * Mock storage for testing file operations.
 */
export function mockStorage() {
  const files = new Map<string, any>();

  return {
    store: vi.fn(async (blob: any) => {
      const id = `storage:${Math.random().toString(36).substr(2, 9)}`;
      files.set(id, blob);
      return id;
    }),
    getUrl: vi.fn(async (storageId: string) => {
      return files.has(storageId) ? `https://mock.storage/${storageId}` : null;
    }),
    delete: vi.fn(async (storageId: string) => {
      files.delete(storageId);
    }),
    _files: files,
  };
}

/**
 * Create a mock QueryCtx for testing queries.
 */
export function mockQueryCtx(options?: {
  userId?: string;
  email?: string;
  name?: string;
  authenticated?: boolean;
  dbData?: Map<string, any>;
}): QueryCtx {
  const db = mockDb();

  // Pre-populate database if provided
  if (options?.dbData) {
    for (const [id, doc] of options.dbData.entries()) {
      db._storage.set(id, doc);
    }
  }

  return {
    db: db as any,
    auth: mockAuth(options) as any,
  } as QueryCtx;
}

/**
 * Create a mock MutationCtx for testing mutations.
 */
export function mockMutationCtx(options?: {
  userId?: string;
  email?: string;
  name?: string;
  authenticated?: boolean;
  dbData?: Map<string, any>;
}): MutationCtx {
  const db = mockDb();

  // Pre-populate database if provided
  if (options?.dbData) {
    for (const [id, doc] of options.dbData.entries()) {
      db._storage.set(id, doc);
    }
  }

  return {
    db: db as any,
    auth: mockAuth(options) as any,
    scheduler: mockScheduler() as any,
    storage: mockStorage() as any,
  } as MutationCtx;
}
