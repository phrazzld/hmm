import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionInput } from "./QuestionInput";

// Mock Convex hooks
vi.mock("convex/react", () => ({
  useMutation: vi.fn(),
}));

// Mock toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

// Import after mocking
import { useMutation } from "convex/react";
import { useToast } from "@/hooks/use-toast";

describe("QuestionInput", () => {
  let mockCreateQuestion: ReturnType<typeof vi.fn>;
  let mockToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks
    mockCreateQuestion = vi.fn();
    mockToast = vi.fn();

    vi.mocked(useMutation).mockReturnValue(mockCreateQuestion as any);
    vi.mocked(useToast).mockReturnValue({ toast: mockToast } as any);
  });

  it("should update textarea when typing", async () => {
    const user = userEvent.setup();
    render(<QuestionInput />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    await user.type(textarea, "What is the meaning of life?");

    expect(textarea).toHaveValue("What is the meaning of life?");
  });

  it("should submit valid question, call mutation, and clear input", async () => {
    const user = userEvent.setup();
    mockCreateQuestion.mockResolvedValue("question-id-123");

    render(<QuestionInput />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    const submitButton = screen.getByRole("button", { name: /save/i });

    // Type a valid question
    await user.type(textarea, "What is the meaning of life?");
    expect(textarea).toHaveValue("What is the meaning of life?");

    // Submit
    await user.click(submitButton);

    // Wait for mutation to be called
    await waitFor(() => {
      expect(mockCreateQuestion).toHaveBeenCalledWith({
        text: "What is the meaning of life?",
      });
    });

    // Input should be cleared
    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });

    // Toast should NOT be called (success case)
    expect(mockToast).not.toHaveBeenCalled();
  });

  it("should show error toast for invalid question and preserve text", async () => {
    const user = userEvent.setup();
    render(<QuestionInput />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    const submitButton = screen.getByRole("button", { name: /save/i });

    // Type an invalid question (too short - less than 3 chars)
    await user.type(textarea, "Hi");
    await user.click(submitButton);

    // Should show error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Invalid question",
        description: expect.stringContaining("at least 3 characters"),
      });
    });

    // Text should be preserved
    expect(textarea).toHaveValue("Hi");

    // Mutation should NOT be called
    expect(mockCreateQuestion).not.toHaveBeenCalled();
  });

  it("should update character counter correctly", async () => {
    const user = userEvent.setup();
    render(<QuestionInput />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");

    // Character counter should not be visible initially (< 80% of 500)
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();

    // Type 410 characters (82% of 500 max)
    const longText = "a".repeat(410);
    await user.type(textarea, longText);

    // Character counter should now be visible
    await waitFor(() => {
      expect(screen.getByText("90")).toBeInTheDocument(); // 500 - 410 = 90
    });
  });

  it("should show warning color when character count is low", async () => {
    const user = userEvent.setup();
    render(<QuestionInput />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");

    // Type 460 characters (92% of 500 max) - leaves 40 chars remaining (< 50)
    const longText = "a".repeat(460);
    await user.type(textarea, longText);

    // Character counter should be visible
    await waitFor(() => {
      const counter = screen.getByText("40");
      expect(counter).toBeInTheDocument();
      // Should have warning color class (text-accent)
      expect(counter).toHaveClass("text-accent");
    });
  });

  it("should submit when Enter key is pressed (without Shift)", async () => {
    const user = userEvent.setup();
    mockCreateQuestion.mockResolvedValue("question-id-123");

    render(<QuestionInput />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");

    // Type a valid question
    await user.type(textarea, "What is the meaning of life?");

    // Press Enter (without Shift)
    await user.keyboard("{Enter}");

    // Mutation should be called
    await waitFor(() => {
      expect(mockCreateQuestion).toHaveBeenCalledWith({
        text: "What is the meaning of life?",
      });
    });
  });

  it("should insert newline when Shift+Enter is pressed (no submit)", async () => {
    const user = userEvent.setup();
    render(<QuestionInput />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");

    // Type a valid question
    await user.type(textarea, "First line");

    // Press Shift+Enter
    await user.keyboard("{Shift>}{Enter}{/Shift}");

    // Should insert newline (exact behavior depends on browser)
    // We verify mutation was NOT called
    expect(mockCreateQuestion).not.toHaveBeenCalled();

    // Textarea should still have content (with newline)
    expect((textarea as HTMLTextAreaElement).value).toContain("First line");
  });

  it("should show error toast and restore text when mutation fails", async () => {
    const user = userEvent.setup();
    const errorMessage = "Network error";
    mockCreateQuestion.mockRejectedValue(new Error(errorMessage));

    render(<QuestionInput />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    const submitButton = screen.getByRole("button", { name: /save/i });

    // Type a valid question
    await user.type(textarea, "What is the meaning of life?");
    await user.click(submitButton);

    // Wait for error handling
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Failed to save question",
        description: errorMessage,
      });
    });

    // Text should be restored
    await waitFor(() => {
      expect(textarea).toHaveValue("What is the meaning of life?");
    });
  });

  it("should call onQuestionCreated callback when question is created", async () => {
    const user = userEvent.setup();
    const onQuestionCreated = vi.fn();
    const questionId = "question-id-123";
    mockCreateQuestion.mockResolvedValue(questionId);

    render(<QuestionInput onQuestionCreated={onQuestionCreated} />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    const submitButton = screen.getByRole("button", { name: /save/i });

    // Type and submit
    await user.type(textarea, "What is the meaning of life?");
    await user.click(submitButton);

    // Callback should be called with question ID
    await waitFor(() => {
      expect(onQuestionCreated).toHaveBeenCalledWith(questionId);
    });
  });

  it("should disable submit button when textarea is empty", async () => {
    render(<QuestionInput />);

    const submitButton = screen.getByRole("button", { name: /save/i });

    // Button should be disabled initially
    expect(submitButton).toBeDisabled();
  });

  it("should disable submit button while mutation is pending", async () => {
    const user = userEvent.setup();
    // Mock mutation that takes time to resolve
    mockCreateQuestion.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve("id"), 100))
    );

    render(<QuestionInput />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    const submitButton = screen.getByRole("button", { name: /save/i });

    // Type valid question
    await user.type(textarea, "What is the meaning of life?");
    expect(submitButton).not.toBeDisabled();

    // Click submit
    await user.click(submitButton);

    // Button should be disabled during mutation
    expect(submitButton).toBeDisabled();

    // Wait for mutation to complete
    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });
});
