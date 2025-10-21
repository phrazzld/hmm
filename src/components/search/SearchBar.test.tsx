import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./SearchBar";

// Mock Convex hooks
vi.mock("convex/react", () => ({
  useAction: vi.fn(),
}));

// Import after mocking
import { useAction } from "convex/react";

describe("SearchBar", () => {
  let mockSemanticSearch: ReturnType<typeof vi.fn>;
  let mockOnResults: ReturnType<typeof vi.fn>;
  let mockOnLoadingChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSemanticSearch = vi.fn();
    mockOnResults = vi.fn();
    mockOnLoadingChange = vi.fn();

    vi.mocked(useAction).mockReturnValue(mockSemanticSearch);
  });

  it("should trigger debounced search after 500ms delay", async () => {
    const user = userEvent.setup();
    const mockResults = [
      {
        question: {
          _id: "q1" as any,
          text: "Test question",
          userId: "u1" as any,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          _creationTime: Date.now(),
        },
        score: 0.9,
      },
    ];
    mockSemanticSearch.mockResolvedValue(mockResults);

    render(<SearchBar onResults={mockOnResults} />);

    const input = screen.getByPlaceholderText("Search your questions...");

    // Type search query
    await user.type(input, "meaning of life");

    // Should not search immediately (debounce delay)
    expect(mockSemanticSearch).not.toHaveBeenCalled();

    // Wait for debounce + search
    await waitFor(
      () => {
        expect(mockSemanticSearch).toHaveBeenCalledWith({
          query: "meaning of life",
        });
      },
      { timeout: 1000 }
    );

    await waitFor(() => {
      expect(mockOnResults).toHaveBeenCalledWith(mockResults, "meaning of life");
    });
  });

  it("should cancel previous debounce when typing rapidly", async () => {
    const user = userEvent.setup();
    mockSemanticSearch.mockResolvedValue([]);

    render(<SearchBar onResults={mockOnResults} />);

    const input = screen.getByPlaceholderText("Search your questions...");

    // Type "hello"
    await user.type(input, "hello");

    // Wait 300ms (less than debounce)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Type more before debounce completes
    await user.clear(input);
    await user.type(input, "hello world");

    // Should search for final query
    await waitFor(
      () => {
        expect(mockSemanticSearch).toHaveBeenCalledWith({
          query: "hello world",
        });
      },
      { timeout: 1000 }
    );

    // Should only be called once (not for intermediate "hello")
    expect(mockSemanticSearch).toHaveBeenCalledTimes(1);
  });

  it("should show loading state during search", async () => {
    const user = userEvent.setup();
    mockSemanticSearch.mockResolvedValue([]);

    render(<SearchBar onLoadingChange={mockOnLoadingChange} />);

    const input = screen.getByPlaceholderText("Search your questions...");

    // Type search query
    await user.type(input, "test");

    // Wait for search to complete
    await waitFor(
      () => {
        expect(mockOnLoadingChange).toHaveBeenCalledWith(true);
      },
      { timeout: 1000 }
    );

    await waitFor(() => {
      expect(mockOnLoadingChange).toHaveBeenCalledWith(false);
    });
  });

  it("should call onResults callback when search returns results", async () => {
    const user = userEvent.setup();
    const mockResults = [
      {
        question: {
          _id: "q1" as any,
          text: "What is the meaning of life?",
          userId: "u1" as any,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          _creationTime: Date.now(),
        },
        score: 0.95,
      },
      {
        question: {
          _id: "q2" as any,
          text: "How do I find purpose?",
          userId: "u1" as any,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          _creationTime: Date.now(),
        },
        score: 0.85,
      },
    ];
    mockSemanticSearch.mockResolvedValue(mockResults);

    render(<SearchBar onResults={mockOnResults} />);

    const input = screen.getByPlaceholderText("Search your questions...");

    // Type and wait for search
    await user.type(input, "meaning");

    // Callback should be called with results
    await waitFor(
      () => {
        expect(mockOnResults).toHaveBeenCalledWith(mockResults, "meaning");
      },
      { timeout: 1000 }
    );
  });

  it("should handle search failure gracefully", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSemanticSearch.mockRejectedValue(new Error("Network error"));

    render(<SearchBar onResults={mockOnResults} />);

    const input = screen.getByPlaceholderText("Search your questions...");

    // Type and wait for search
    await user.type(input, "test");

    // Should call onResults with empty array
    await waitFor(
      () => {
        expect(mockOnResults).toHaveBeenCalledWith([], "test");
      },
      { timeout: 1000 }
    );

    // Should log error
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should not trigger search for empty query", async () => {
    render(<SearchBar onResults={mockOnResults} />);

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Should not search
    expect(mockSemanticSearch).not.toHaveBeenCalled();

    // Should call onResults with empty array
    expect(mockOnResults).toHaveBeenCalledWith([], "");
  });

  it("should not trigger search for whitespace-only query", async () => {
    const user = userEvent.setup();

    render(<SearchBar onResults={mockOnResults} />);

    const input = screen.getByPlaceholderText("Search your questions...");

    // Type whitespace
    await user.type(input, "   ");

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Should not search
    expect(mockSemanticSearch).not.toHaveBeenCalled();

    // Should call onResults with empty array
    expect(mockOnResults).toHaveBeenCalledWith([], "");
  });

  it("should accept custom placeholder text", () => {
    render(<SearchBar placeholder="Find your thoughts..." />);

    expect(screen.getByPlaceholderText("Find your thoughts...")).toBeInTheDocument();
  });
});
