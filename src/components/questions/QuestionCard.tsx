"use client";

import { motion } from "framer-motion";
import { formatRelativeDate, truncateText } from "@/lib/date";
import { RelatedQuestions } from "./RelatedQuestions";
import { Leaf } from "lucide-react";
import type { Doc } from "@/../convex/_generated/dataModel";

interface QuestionCardProps {
  question: Doc<"questions">;
  showRelated?: boolean;
  index?: number;
}

/**
 * Card component for displaying individual questions.
 */
export function QuestionCard({
  question,
  showRelated = true,
  index = 0,
}: QuestionCardProps) {
  const displayText = truncateText(question.text, 200);
  const relativeDate = formatRelativeDate(question.createdAt);

  // Calculate age-based styling (newer = lighter, older = richer)
  const ageInDays = Math.floor((Date.now() - question.createdAt) / (1000 * 60 * 60 * 24));
  const isRecent = ageInDays < 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="group relative"
    >
      {/* Card container */}
      <div className={`
        relative bg-bg-muted rounded-garden-lg p-6
        border border-border-subtle
        shadow-garden-sm hover:shadow-garden-md
        transition-all duration-300
        ${isRecent ? 'bg-bg-surface' : 'bg-bg-muted'}
      `}>
        {/* Subtle inner shadow for depth */}
        <div className="absolute inset-0 rounded-garden-lg shadow-garden-inner pointer-events-none" />

        {/* Recency indicator */}
        <div className={`
          absolute top-4 right-4 opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          ${isRecent ? 'text-text-tertiary' : 'text-text-secondary'}
        `}>
          <Leaf className="w-4 h-4" />
        </div>

        {/* Question text */}
        <div className="relative space-y-3">
          <p className="text-text-emphasis leading-relaxed text-base">
            {displayText}
          </p>

          {/* Timestamp and recency badge */}
          <div className="flex items-center gap-2 text-xs text-text-tertiary font-medium">
            <span>Asked {relativeDate}</span>
            {isRecent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-subtle text-text-primary">
                <Leaf className="w-3 h-3" />
                <span>Recent</span>
              </span>
            )}
          </div>
        </div>

        {/* Related questions section */}
        {showRelated && (
          <div className="mt-4 pt-4 border-t border-border-subtle/50">
            <RelatedQuestions questionId={question._id} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
