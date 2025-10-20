"use client";

import { formatRelativeDate, truncateText } from "@/lib/date";
import { RelatedQuestions } from "./RelatedQuestions";
import type { Doc } from "@/../convex/_generated/dataModel";

interface QuestionCardProps {
  question: Doc<"questions">;
  showRelated?: boolean;
  index?: number;
}

/**
 * Card component for displaying individual questions.
 */
export function QuestionCard({ question, showRelated = true, index = 0 }: QuestionCardProps) {
  const displayText = truncateText(question.text, 200);
  const relativeDate = formatRelativeDate(question.createdAt);

  // Calculate age-based styling (newer = lighter, older = richer)
  const ageInDays = Math.floor((Date.now() - question.createdAt) / (1000 * 60 * 60 * 24));
  const isRecent = ageInDays < 7;

  return (
    <div
      className="group relative animate-fade-in-up hover:-translate-y-0.5 transition-transform duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card container - tightened padding */}
      <div
        className={`
        relative rounded-garden-lg p-4
        border border-border-subtle
        shadow-garden-sm hover:shadow-garden-md
        transition-all duration-300
        ${isRecent ? "bg-bg-surface" : "bg-bg-muted"}
      `}
      >
        {/* Subtle inner shadow for depth */}
        <div className="absolute inset-0 rounded-garden-lg shadow-garden-inner pointer-events-none" />

        {/* Question text */}
        <div className="relative space-y-2">
          <p className="text-text-emphasis leading-relaxed text-base pr-6">{displayText}</p>

          {/* Timestamp with subtle recent indicator */}
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            {isRecent && (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-green-500/60"
                title="Recent question"
              />
            )}
            <span>Asked {relativeDate}</span>
          </div>
        </div>

        {/* Related questions section - reduced spacing */}
        {showRelated && (
          <div className="mt-3 pt-3 border-t border-border-subtle/50">
            <RelatedQuestions questionId={question._id} />
          </div>
        )}
      </div>
    </div>
  );
}
