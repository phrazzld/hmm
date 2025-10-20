import { describe, it, expect } from "vitest";
import { validateQuestion, QUESTION_MIN_LENGTH, QUESTION_MAX_LENGTH } from "./validation";

describe("validateQuestion", () => {
  it("should reject empty question", () => {
    const result = validateQuestion("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Question cannot be empty");
  });

  it("should reject whitespace-only question", () => {
    const result = validateQuestion("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Question cannot be empty");
  });

  it("should reject question under min length", () => {
    const result = validateQuestion("ab"); // 2 chars, min is 3
    expect(result.valid).toBe(false);
    expect(result.error).toBe(`Question must be at least ${QUESTION_MIN_LENGTH} characters`);
  });

  it("should accept valid question at min length", () => {
    const result = validateQuestion("abc"); // exactly 3 chars
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept valid question in middle range", () => {
    const result = validateQuestion("What is the meaning of life?");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept valid question at max length", () => {
    const maxLengthQuestion = "a".repeat(QUESTION_MAX_LENGTH);
    const result = validateQuestion(maxLengthQuestion);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject question over max length", () => {
    const tooLongQuestion = "a".repeat(QUESTION_MAX_LENGTH + 1);
    const result = validateQuestion(tooLongQuestion);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(`Question must be less than ${QUESTION_MAX_LENGTH} characters`);
  });

  it("should trim whitespace before validating", () => {
    const result = validateQuestion("  valid question  ");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should trim whitespace when checking min length", () => {
    // "  ab  " trims to "ab" (2 chars) - should fail
    const result = validateQuestion("  ab  ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe(`Question must be at least ${QUESTION_MIN_LENGTH} characters`);
  });

  it("should trim whitespace when checking max length", () => {
    // Create string with exactly max length after trimming
    const content = "a".repeat(QUESTION_MAX_LENGTH);
    const withWhitespace = `  ${content}  `;
    const result = validateQuestion(withWhitespace);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
