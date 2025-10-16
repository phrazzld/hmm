"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { QuestionCard } from "./QuestionCard";

interface QuestionListProps {
  limit?: number;
}

/**
 * Question list with real-time subscription.
 * Automatically updates when questions are added via Convex.
 */
export function QuestionList({ limit }: QuestionListProps) {
  const questions = useQuery(api.questions.getQuestions, { limit });

  if (questions === undefined) {
    // Loading state
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No questions yet.</p>
        <p className="text-sm mt-2">Ask your first question above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard key={question._id} question={question} />
      ))}
    </div>
  );
}
