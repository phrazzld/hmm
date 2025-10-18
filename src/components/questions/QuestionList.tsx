"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { api } from "@/../convex/_generated/api";
import { QuestionCard } from "./QuestionCard";
import { Sprout } from "lucide-react";

interface QuestionListProps {
  limit?: number;
}

/**
 * Question list with smooth animations.
 * Displays user's questions.
 */
export function QuestionList({ limit }: QuestionListProps) {
  const questions = useQuery(api.questions.getQuestions, { limit });

  if (questions === undefined) {
    // Loading state
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

  if (questions.length === 0) {
    // Empty state
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
          <p className="text-lg font-serif text-text-primary">
            No questions yet
          </p>
          <p className="text-sm text-text-secondary">
            Ask your first question above
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <QuestionCard
          key={question._id}
          question={question}
          index={index}
        />
      ))}
    </div>
  );
}
