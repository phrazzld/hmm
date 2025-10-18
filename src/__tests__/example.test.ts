import { describe, it, expect } from "vitest";

describe("Example test suite", () => {
  it("should pass basic assertion", () => {
    expect(true).toBe(true);
  });

  it("should handle arithmetic", () => {
    expect(2 + 2).toBe(4);
  });
});
