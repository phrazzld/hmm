"use client";

import { usePaginatedQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "@/../convex/_generated/api";
import { QuestionCard } from "./QuestionCard";
import { Button } from "@/components/ui/button";
import { Sprout, Loader2 } from "lucide-react";

interface QuestionListProps {
  initialPageSize?: number;
}

/**
 * Question list with smooth animations and pagination.
 * Displays user's questions.
 */
export function QuestionList({ initialPageSize = 20 }: QuestionListProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.questions.getQuestions,
    {},
    { initialNumItems: initialPageSize }
  );

  // Loading initial page
  if (status === "LoadingFirstPage") {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="h-32 bg-bg-muted rounded-garden-lg animate-pulse border border-border-subtle"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 space-y-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-subtle">
          <Sprout className="w-8 h-8 text-text-secondary" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-serif text-text-primary">No questions yet</p>
          <p className="text-sm text-text-secondary">Ask your first question above</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question cards */}
      {results.map((question, index) => (
        <QuestionCard key={question._id} question={question} index={index} />
      ))}

      {/* Load More button */}
      {status === "CanLoadMore" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-4"
        >
          <Button onClick={() => loadMore(20)} variant="outline" className="w-full max-w-xs">
            Load more questions
          </Button>
        </motion.div>
      )}

      {/* Loading more state */}
      {status === "LoadingMore" && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
}
