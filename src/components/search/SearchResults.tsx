"use client";

import { QuestionCard } from "@/components/questions/QuestionCard";
import type { Id } from "@/../convex/_generated/dataModel";

interface SearchResult {
  question: {
    _id: Id<"questions">;
    text: string;
    createdAt: number;
    userId: Id<"users">;
    updatedAt: number;
  };
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

/**
 * Search results display.
 * Shows list of questions matching semantic search query.
 */
export function SearchResults({ results, query }: SearchResultsProps) {
  if (!query.trim()) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">Enter a search query to find related questions.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No results found</p>
        <p className="text-sm mt-2">
          Try rephrasing your search or ask a new question.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Found {results.length} {results.length === 1 ? "question" : "questions"}
      </p>
      {results.map(({ question }) => (
        <QuestionCard key={question._id} question={question} showRelated={false} />
      ))}
    </div>
  );
}
