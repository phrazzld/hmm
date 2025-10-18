"use client";

import { formatRelativeDate, truncateText } from "@/lib/date";
import type { Doc } from "@/../convex/_generated/dataModel";

interface SearchResult {
  question: Doc<"questions">;
  score: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  isLoading?: boolean;
}

/**
 * Search results display.
 * Shows list of questions matching semantic search query with similarity scores.
 */
export function SearchResults({ results, query, isLoading = false }: SearchResultsProps) {
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
            className="h-20 bg-bg-muted rounded-garden-sm animate-pulse border border-border-subtle"
          />
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

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Found {results.length} {results.length === 1 ? "question" : "questions"}
      </p>
      <div className="space-y-2">
        {results.map(({ question, score }) => {
          const scorePercentage = Math.round(score * 100);
          const isWeakMatch = score < 0.5;

          return (
            <div
              key={question._id}
              className="p-3 rounded-garden-sm hover:bg-bg-subtle cursor-pointer transition-colors border border-border-subtle"
              title={`${scorePercentage}% similar`}
            >
              <p className="text-text-emphasis leading-relaxed">
                {truncateText(question.text, 100)}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-text-tertiary">
                    Asked {formatRelativeDate(question.createdAt)}
                  </p>
                  {isWeakMatch && (
                    <span className="text-xs text-text-tertiary italic">· weakly matched</span>
                  )}
                </div>
                <span className="text-xs font-medium text-text-secondary">{scorePercentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
