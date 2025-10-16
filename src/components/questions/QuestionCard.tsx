"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelativeDate, truncateText } from "@/lib/date";
import { RelatedQuestions } from "./RelatedQuestions";
import type { Doc } from "@/../convex/_generated/dataModel";

interface QuestionCardProps {
  question: Doc<"questions">;
  showRelated?: boolean;
}

/**
 * Question card component.
 * Displays question text, creation date, and collapsible related questions.
 */
export function QuestionCard({
  question,
  showRelated = true,
}: QuestionCardProps) {
  const displayText = truncateText(question.text, 200);
  const relativeDate = formatRelativeDate(question.createdAt);

  return (
    <Card className="w-full transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-normal leading-relaxed">
          {displayText}
        </CardTitle>
        <CardDescription className="text-xs">
          {relativeDate}
        </CardDescription>
      </CardHeader>
      {showRelated && (
        <CardFooter className="pt-0">
          <RelatedQuestions questionId={question._id} />
        </CardFooter>
      )}
    </Card>
  );
}
