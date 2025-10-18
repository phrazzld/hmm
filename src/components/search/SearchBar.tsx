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

/**
 * Search bar with debounced semantic search.
 * Delays search until user stops typing (500ms).
 */
export function SearchBar({
  onResults,
  onLoadingChange,
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
      setIsLoading(false);
      onLoadingChange?.(false);
      return;
    }

    // Perform search
    const performSearch = async () => {
      setIsLoading(true);
      onLoadingChange?.(true);
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
          isLoading ? "text-interactive-primary" : "text-text-tertiary"
        )}
      />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "pl-10 transition-all duration-200",
          isLoading &&
            "border-interactive-primary ring-2 ring-interactive-primary/20 animate-[search-pulse_2s_ease-in-out_infinite]"
        )}
      />
      <style jsx>{`
        @keyframes search-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }
      `}</style>
    </div>
  );
}
