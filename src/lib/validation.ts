/**
 * Question validation rules.
 * Min/max constraints for question text.
 */
export const QUESTION_MIN_LENGTH = 3;
export const QUESTION_MAX_LENGTH = 500;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate question text.
 * Returns validation result with error message if invalid.
 */
export function validateQuestion(text: string): ValidationResult {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Question cannot be empty" };
  }

  if (trimmed.length < QUESTION_MIN_LENGTH) {
    return {
      valid: false,
      error: `Question must be at least ${QUESTION_MIN_LENGTH} characters`,
    };
  }

  if (trimmed.length > QUESTION_MAX_LENGTH) {
    return {
      valid: false,
      error: `Question must be less than ${QUESTION_MAX_LENGTH} characters`,
    };
  }

  return { valid: true };
}
