"use client";

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { Search, Loader2 } from "lucide-react";
import { api } from "@/../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import type { Doc } from "@/../convex/_generated/dataModel";

interface SearchResult {
  question: Doc<"questions">;
}

interface SearchBarProps {
  onResults?: (results: SearchResult[], query: string) => void;
  placeholder?: string;
}

/**
 * Search bar with debounced semantic search.
 * Delays search until user stops typing (500ms).
 */
export function SearchBar({
  onResults,
  placeholder = "Search your questions...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const semanticSearch = useAction(api.actions.search.semanticSearch);

  useEffect(() => {
    // Don't search for empty queries
    if (!debouncedQuery.trim()) {
      onResults?.([], "");
      return;
    }

    // Perform search
    const performSearch = async () => {
      setIsLoading(true);
      try {
        const results = await semanticSearch({
          query: debouncedQuery,
          limit: 10,
        });
        onResults?.(results, debouncedQuery);
      } catch (error) {
        console.error("Search failed:", error);
        onResults?.([], debouncedQuery);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, semanticSearch, onResults]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 animate-spin" />
      )}
    </div>
  );
}
