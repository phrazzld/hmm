import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RelatedQuestions } from "./RelatedQuestions";

// Mock Convex hooks
vi.mock("convex/react", () => ({
  useAction: vi.fn(),
}));

// Import after mocking
import { useAction } from "convex/react";

describe("RelatedQuestions", () => {
  let mockGetRelated: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetRelated = vi.fn();
    vi.mocked(useAction).mockReturnValue(mockGetRelated);
  });

  it("should be collapsed by default (progressive disclosure)", () => {
    render(<RelatedQuestions questionId={"q1" as any} />);

    // Trigger button should be visible
    const trigger = screen.getByRole("button", { name: /related/i });
    expect(trigger).toBeInTheDocument();

    // Content should not be visible (Collapsible is closed)
    expect(screen.queryByText(/No related questions/i)).not.toBeInTheDocument();
  });

  it("should trigger action call on first expand (lazy loading)", async () => {
    const user = userEvent.setup();
    const mockResults = [
      {
        question: {
          _id: "q2" as any,
          text: "What is the meaning of life?",
          userId: "u1" as any,
          createdAt: Date.now() - 1000,
          updatedAt: Date.now() - 1000,
          _creationTime: Date.now() - 1000,
        },
        score: 0.95,
      },
    ];
    mockGetRelated.mockResolvedValue(mockResults);

    render(<RelatedQuestions questionId={"q1" as any} />);

    const trigger = screen.getByRole("button", { name: /related/i });

    // Should not call action initially
    expect(mockGetRelated).not.toHaveBeenCalled();

    // Click to expand
    await user.click(trigger);

    // Should call action with question ID and limit
    await waitFor(() => {
      expect(mockGetRelated).toHaveBeenCalledWith({
        questionId: "q1",
        limit: 5,
      });
    });

    // Results should be displayed
    await waitFor(() => {
      expect(screen.getByText(/What is the meaning of life/i)).toBeInTheDocument();
    });
  });

  it("should reuse cached results on second expand (no duplicate call)", async () => {
    const user = userEvent.setup();
    const mockResults = [
      {
        question: {
          _id: "q2" as any,
          text: "Cached question",
          userId: "u1" as any,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          _creationTime: Date.now(),
        },
        score: 0.9,
      },
    ];
    mockGetRelated.mockResolvedValue(mockResults);

    render(<RelatedQuestions questionId={"q1" as any} />);

    const trigger = screen.getByRole("button", { name: /related/i });

    // First expand
    await user.click(trigger);
    await waitFor(() => {
      expect(mockGetRelated).toHaveBeenCalledTimes(1);
    });

    // Collapse
    await user.click(trigger);

    // Second expand
    await user.click(trigger);

    // Should still only be called once (cached)
    expect(mockGetRelated).toHaveBeenCalledTimes(1);

    // Results should still be visible
    expect(screen.getByText(/Cached question/i)).toBeInTheDocument();
  });

  it("should show loading state with skeleton cards", async () => {
    const user = userEvent.setup();
    // Mock slow loading
    mockGetRelated.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    render(<RelatedQuestions questionId={"q1" as any} />);

    const trigger = screen.getByRole("button", { name: /related/i });

    // Expand
    await user.click(trigger);

    // Should show skeleton loading state (3 skeleton cards)
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(3);

    // Wait for loading to complete
    await waitFor(
      () => {
        expect(screen.queryByText(/No related questions/i)).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it("should show 'No related questions' when results are empty", async () => {
    const user = userEvent.setup();
    mockGetRelated.mockResolvedValue([]);

    render(<RelatedQuestions questionId={"q1" as any} />);

    const trigger = screen.getByRole("button", { name: /related/i });

    // Expand
    await user.click(trigger);

    // Should show empty state message
    await waitFor(() => {
      expect(screen.getByText(/No related questions found yet/i)).toBeInTheDocument();
    });
  });

  it("should render results as question cards with text and timestamp", async () => {
    const user = userEvent.setup();
    const now = Date.now();
    const mockResults = [
      {
        question: {
          _id: "q2" as any,
          text: "First related question",
          userId: "u1" as any,
          createdAt: now - 3600000, // 1 hour ago
          updatedAt: now - 3600000,
          _creationTime: now - 3600000,
        },
        score: 0.95,
      },
      {
        question: {
          _id: "q3" as any,
          text: "Second related question",
          userId: "u1" as any,
          createdAt: now - 86400000, // 1 day ago
          updatedAt: now - 86400000,
          _creationTime: now - 86400000,
        },
        score: 0.85,
      },
    ];
    mockGetRelated.mockResolvedValue(mockResults);

    render(<RelatedQuestions questionId={"q1" as any} />);

    const trigger = screen.getByRole("button", { name: /related/i });

    // Expand
    await user.click(trigger);

    // Both questions should be rendered
    await waitFor(() => {
      expect(screen.getByText(/First related question/i)).toBeInTheDocument();
      expect(screen.getByText(/Second related question/i)).toBeInTheDocument();
    });

    // Timestamps should be displayed (relative format)
    // Note: exact text depends on formatRelativeDate implementation
    const timestamps = screen.getAllByText(/ago/i);
    expect(timestamps.length).toBeGreaterThan(0);
  });

  it("should handle fetch errors gracefully", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetRelated.mockRejectedValue(new Error("Network error"));

    render(<RelatedQuestions questionId={"q1" as any} />);

    const trigger = screen.getByRole("button", { name: /related/i });

    // Expand
    await user.click(trigger);

    // Should show empty state (error handled gracefully)
    await waitFor(() => {
      expect(screen.getByText(/No related questions found yet/i)).toBeInTheDocument();
    });

    // Should log error
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should respect custom limit prop", async () => {
    const user = userEvent.setup();
    mockGetRelated.mockResolvedValue([]);

    render(<RelatedQuestions questionId={"q1" as any} limit={10} />);

    const trigger = screen.getByRole("button", { name: /related/i });

    // Expand
    await user.click(trigger);

    // Should call with custom limit
    await waitFor(() => {
      expect(mockGetRelated).toHaveBeenCalledWith({
        questionId: "q1",
        limit: 10,
      });
    });
  });

  it("should truncate long question text", async () => {
    const user = userEvent.setup();
    const longText =
      "This is a very long question that exceeds the truncation limit and should be cut off with ellipsis to prevent the UI from breaking and to maintain a clean visual appearance for the user when viewing related questions in the collapsible panel.";
    const mockResults = [
      {
        question: {
          _id: "q2" as any,
          text: longText,
          userId: "u1" as any,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          _creationTime: Date.now(),
        },
        score: 0.9,
      },
    ];
    mockGetRelated.mockResolvedValue(mockResults);

    render(<RelatedQuestions questionId={"q1" as any} />);

    const trigger = screen.getByRole("button", { name: /related/i });

    // Expand
    await user.click(trigger);

    // Text should be truncated (component uses truncateText with 100 char limit)
    await waitFor(() => {
      const displayedText = screen.getByText(/This is a very long question/i);
      expect(displayedText.textContent!.length).toBeLessThan(longText.length);
    });
  });
});
