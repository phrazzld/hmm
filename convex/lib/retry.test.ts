import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withRetry } from "./retry";

describe("withRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should return result on first attempt success", async () => {
    const fn = vi.fn().mockResolvedValue("success");

    const promise = withRetry(fn);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry once on transient failure then success", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("Transient failure"))
      .mockResolvedValue("success");

    const promise = withRetry(fn, { maxRetries: 3 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should throw last error after max retries exceeded", async () => {
    const error = new Error("Persistent failure");
    const fn = vi.fn().mockRejectedValue(error);

    const promise = withRetry(fn, { maxRetries: 2 });

    // Advance timers and await the promise rejection
    const runTimers = vi.runAllTimersAsync();
    await expect(promise).rejects.toThrow("Persistent failure");
    await runTimers;

    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it("should use exponential backoff delays", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Fail"));

    const promise = withRetry(fn, {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 8000,
    });

    // Catch promise rejection to avoid unhandled warnings
    promise.catch(() => {});

    // First attempt fails immediately
    await vi.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);

    // First retry after ~1s delay (2^0 * 1000 + jitter)
    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenCalledTimes(2);

    // Second retry after ~2s delay (2^1 * 1000 + jitter)
    await vi.advanceTimersByTimeAsync(3000);
    expect(fn).toHaveBeenCalledTimes(3);

    // Third retry after ~4s delay (2^2 * 1000 + jitter)
    await vi.advanceTimersByTimeAsync(5000);
    expect(fn).toHaveBeenCalledTimes(4);

    // Properly await the rejection
    await expect(promise).rejects.toThrow("Fail");
  });

  it("should respect custom maxRetries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Fail"));

    const promise = withRetry(fn, { maxRetries: 1 });

    const runTimers = vi.runAllTimersAsync();
    await expect(promise).rejects.toThrow("Fail");
    await runTimers;

    expect(fn).toHaveBeenCalledTimes(2); // initial + 1 retry
  });

  it("should respect custom baseDelay", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Fail"));

    const promise = withRetry(fn, {
      maxRetries: 1,
      baseDelay: 500,
    });

    // Catch promise rejection to avoid unhandled warnings
    promise.catch(() => {});

    // Initial attempt
    await vi.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);

    // Retry after ~500ms delay
    await vi.advanceTimersByTimeAsync(1500);
    expect(fn).toHaveBeenCalledTimes(2);

    // Properly await the rejection
    await expect(promise).rejects.toThrow("Fail");
  });

  it("should respect maxDelay cap", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Fail"));

    const promise = withRetry(fn, {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 3000, // Cap at 3s instead of default 8s
    });

    // Run through all retries
    const runTimers = vi.runAllTimersAsync();
    await expect(promise).rejects.toThrow("Fail");
    await runTimers;

    expect(fn).toHaveBeenCalledTimes(6); // initial + 5 retries
  });

  it("should apply jitter to delays", async () => {
    // Mock Math.random to return consistent values for testing jitter
    const originalRandom = Math.random;
    Math.random = vi.fn().mockReturnValue(0.5); // 500ms jitter

    const fn = vi.fn().mockRejectedValue(new Error("Fail"));

    const promise = withRetry(fn, {
      maxRetries: 1,
      baseDelay: 1000,
    });

    // Catch promise rejection to avoid unhandled warnings
    promise.catch(() => {});

    // Initial attempt
    await vi.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);

    // Delay should be: baseDelay * 2^0 + jitter = 1000 + 500 = 1500ms
    await vi.advanceTimersByTimeAsync(1500);
    expect(fn).toHaveBeenCalledTimes(2);

    // Properly await the rejection
    await expect(promise).rejects.toThrow("Fail");

    Math.random = originalRandom;
  });

  it("should use default options when none provided", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Fail"));

    const promise = withRetry(fn);

    const runTimers = vi.runAllTimersAsync();
    await expect(promise).rejects.toThrow("Fail");
    await runTimers;

    // Default maxRetries is 3, so total calls = 4 (initial + 3 retries)
    expect(fn).toHaveBeenCalledTimes(4);
  });
});
