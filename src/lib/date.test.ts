import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatRelativeDate, truncateText } from "./date";

describe("formatRelativeDate", () => {
  const NOW = 1700000000000; // Fixed timestamp for testing

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 'just now' for timestamps less than 60 seconds ago", () => {
    const timestamp = NOW - 30 * 1000; // 30 seconds ago
    expect(formatRelativeDate(timestamp)).toBe("just now");
  });

  it("should return 'just now' for timestamps exactly 59 seconds ago", () => {
    const timestamp = NOW - 59 * 1000;
    expect(formatRelativeDate(timestamp)).toBe("just now");
  });

  it("should return '1 minute ago' for timestamp exactly 1 minute ago", () => {
    const timestamp = NOW - 60 * 1000; // Exactly 60 seconds
    expect(formatRelativeDate(timestamp)).toBe("1 minute ago");
  });

  it("should return 'X minutes ago' for timestamps between 2-59 minutes", () => {
    const timestamp2min = NOW - 2 * 60 * 1000;
    expect(formatRelativeDate(timestamp2min)).toBe("2 minutes ago");

    const timestamp30min = NOW - 30 * 60 * 1000;
    expect(formatRelativeDate(timestamp30min)).toBe("30 minutes ago");

    const timestamp59min = NOW - 59 * 60 * 1000;
    expect(formatRelativeDate(timestamp59min)).toBe("59 minutes ago");
  });

  it("should return '1 hour ago' for timestamp exactly 1 hour ago", () => {
    const timestamp = NOW - 60 * 60 * 1000;
    expect(formatRelativeDate(timestamp)).toBe("1 hour ago");
  });

  it("should return 'X hours ago' for timestamps between 2-23 hours", () => {
    const timestamp2hrs = NOW - 2 * 60 * 60 * 1000;
    expect(formatRelativeDate(timestamp2hrs)).toBe("2 hours ago");

    const timestamp12hrs = NOW - 12 * 60 * 60 * 1000;
    expect(formatRelativeDate(timestamp12hrs)).toBe("12 hours ago");

    const timestamp23hrs = NOW - 23 * 60 * 60 * 1000;
    expect(formatRelativeDate(timestamp23hrs)).toBe("23 hours ago");
  });

  it("should return '1 day ago' for timestamp exactly 1 day ago", () => {
    const timestamp = NOW - 24 * 60 * 60 * 1000;
    expect(formatRelativeDate(timestamp)).toBe("1 day ago");
  });

  it("should return 'X days ago' for timestamps between 2-29 days", () => {
    const timestamp2days = NOW - 2 * 24 * 60 * 60 * 1000;
    expect(formatRelativeDate(timestamp2days)).toBe("2 days ago");

    const timestamp15days = NOW - 15 * 24 * 60 * 60 * 1000;
    expect(formatRelativeDate(timestamp15days)).toBe("15 days ago");

    const timestamp29days = NOW - 29 * 24 * 60 * 60 * 1000;
    expect(formatRelativeDate(timestamp29days)).toBe("29 days ago");
  });

  it("should return '1 month ago' for timestamp exactly 30 days ago", () => {
    const timestamp = NOW - 30 * 24 * 60 * 60 * 1000;
    expect(formatRelativeDate(timestamp)).toBe("1 month ago");
  });

  it("should return 'X months ago' for timestamps between 2-11 months", () => {
    const timestamp2months = NOW - 60 * 24 * 60 * 60 * 1000; // ~2 months
    expect(formatRelativeDate(timestamp2months)).toBe("2 months ago");

    const timestamp6months = NOW - 180 * 24 * 60 * 60 * 1000; // ~6 months
    expect(formatRelativeDate(timestamp6months)).toBe("6 months ago");

    const timestamp11months = NOW - 330 * 24 * 60 * 60 * 1000; // ~11 months
    expect(formatRelativeDate(timestamp11months)).toBe("11 months ago");
  });

  it("should return '1 year ago' for timestamp exactly 12 months ago", () => {
    const timestamp = NOW - 360 * 24 * 60 * 60 * 1000; // ~12 months
    expect(formatRelativeDate(timestamp)).toBe("1 year ago");
  });

  it("should return 'X years ago' for timestamps over 1 year", () => {
    const timestamp2years = NOW - 720 * 24 * 60 * 60 * 1000; // ~2 years
    expect(formatRelativeDate(timestamp2years)).toBe("2 years ago");

    const timestamp5years = NOW - 1800 * 24 * 60 * 60 * 1000; // ~5 years
    expect(formatRelativeDate(timestamp5years)).toBe("5 years ago");
  });
});

describe("truncateText", () => {
  it("should return original text if under max length", () => {
    const text = "Hello world";
    expect(truncateText(text, 20)).toBe("Hello world");
  });

  it("should return original text if exactly at max length", () => {
    const text = "Hello world";
    expect(truncateText(text, 11)).toBe("Hello world");
  });

  it("should truncate text over max length with ellipsis", () => {
    const text = "Hello world, this is a long text";
    const result = truncateText(text, 11);
    expect(result).toBe("Hello world...");
    expect(result.length).toBe(14); // 11 chars + "..."
  });

  it("should return empty string for empty input", () => {
    expect(truncateText("", 10)).toBe("");
  });

  it("should handle very long text", () => {
    const longText = "a".repeat(1000);
    const result = truncateText(longText, 200);
    expect(result).toBe("a".repeat(200) + "...");
    expect(result.length).toBe(203);
  });

  it("should trim whitespace before adding ellipsis", () => {
    const text = "Hello world     extra text";
    const result = truncateText(text, 11);
    // Should truncate to "Hello world", trim trailing spaces, add "..."
    expect(result).toBe("Hello world...");
  });

  it("should handle maxLength of 0", () => {
    const text = "Hello";
    const result = truncateText(text, 0);
    expect(result).toBe("...");
  });

  it("should handle maxLength of 1", () => {
    const text = "Hello world";
    const result = truncateText(text, 1);
    expect(result).toBe("H...");
  });
});
