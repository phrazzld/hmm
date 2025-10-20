"use client";

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { Search } from "lucide-react";
import { api } from "@/../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { Doc } from "@/../convex/_generated/dataModel";

interface SearchResult {
  question: Doc<"questions">;
  score: number;
}

interface SearchBarProps {
  onResults?: (results: SearchResult[], query: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  placeholder?: string;
}

const LOADING_DISPLAY_DELAY = 300; // Only show loading indicator if search takes > 300ms

/**
 * Search bar with debounced semantic search.
 * Delays search until user stops typing (500ms).
 * Uses delayed loading indicator to prevent flicker on fast searches.
 */
export function SearchBar({
  onResults,
  onLoadingChange,
  placeholder = "Search your questions...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isActuallyLoading, setIsActuallyLoading] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const semanticSearch = useAction(api.actions.search.semanticSearch);

  // Delayed loading indicator: only show if search takes > 300ms
  useEffect(() => {
    if (!isActuallyLoading) {
      setShowLoadingIndicator(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowLoadingIndicator(true);
    }, LOADING_DISPLAY_DELAY);

    return () => clearTimeout(timer);
  }, [isActuallyLoading]);

  useEffect(() => {
    // Don't search for empty queries
    if (!debouncedQuery.trim()) {
      onResults?.([], "");
      setIsActuallyLoading(false);
      onLoadingChange?.(false);
      return;
    }

    // Perform search
    const performSearch = async () => {
      setIsActuallyLoading(true);
      onLoadingChange?.(true);
      try {
        const results = await semanticSearch({
          query: debouncedQuery,
          // Fetch more results upfront for client-side pagination
        });
        onResults?.(results, debouncedQuery);
      } catch (error) {
        console.error("Search failed:", error);
        onResults?.([], debouncedQuery);
      } finally {
        setIsActuallyLoading(false);
        onLoadingChange?.(false);
      }
    };

    performSearch();
  }, [debouncedQuery, semanticSearch, onResults, onLoadingChange]);

  return (
    <div className="relative">
      <Search
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
          showLoadingIndicator ? "text-interactive-primary" : "text-text-tertiary"
        )}
      />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
}
