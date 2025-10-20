"use client";

import { useState, useEffect } from "react";
import { formatRelativeDate, truncateText } from "@/lib/date";
import { RelatednessIndicator } from "@/components/questions/RelatednessBars";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Doc } from "@/../convex/_generated/dataModel";

interface SearchResult {
  question: Doc<"questions">;
  score: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

const INITIAL_PAGE_SIZE = 10;

/**
 * Search results display with pagination.
 * Shows list of questions matching semantic search query with similarity scores.
 */
export function SearchResults({
  results,
  query,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: SearchResultsProps) {
  const [displayCount, setDisplayCount] = useState(INITIAL_PAGE_SIZE);

  // Reset display count when query changes
  useEffect(() => {
    setDisplayCount(INITIAL_PAGE_SIZE);
  }, [query]);

  const displayedResults = results.slice(0, displayCount);
  const canLoadMore = displayCount < results.length || hasMore;
  if (!query.trim()) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p className="text-sm">Enter a search query to find related questions.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 p-3 rounded-garden-sm border border-border-subtle bg-bg-surface animate-pulse"
          >
            {/* Skeleton for relatedness indicator */}
            <div className="flex-shrink-0 pt-0.5">
              <div className="w-12 h-4 bg-bg-muted rounded" />
            </div>

            {/* Skeleton for question content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 bg-bg-muted rounded w-full" />
              <div className="h-4 bg-bg-muted rounded w-3/4" />
              <div className="h-3 bg-bg-muted rounded w-24 mt-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p className="text-lg">No results found</p>
        <p className="text-sm mt-2">Try rephrasing your search or ask a new question.</p>
      </div>
    );
  }

  const handleLoadMore = () => {
    if (displayCount < results.length) {
      // Load more from current results
      setDisplayCount((prev) => Math.min(prev + INITIAL_PAGE_SIZE, results.length));
    } else if (onLoadMore) {
      // Fetch more results from server
      onLoadMore();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Found {results.length} {results.length === 1 ? "question" : "questions"}
      </p>
      <div className="space-y-2">
        {displayedResults.map(({ question, score }) => (
          <div
            key={question._id}
            className="flex items-start gap-2.5 p-3 rounded-garden-sm hover:bg-bg-subtle cursor-pointer transition-colors border border-border-subtle"
          >
            {/* Visual strength indicator */}
            <div className="flex-shrink-0 pt-0.5">
              <RelatednessIndicator score={score} showPercentage />
            </div>

            {/* Question content */}
            <div className="flex-1 min-w-0">
              <p className="text-text-emphasis leading-relaxed">
                {truncateText(question.text, 100)}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                Asked {formatRelativeDate(question.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Load More button */}
      {canLoadMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="w-full max-w-xs"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more...
              </span>
            ) : (
              "Load more results"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
