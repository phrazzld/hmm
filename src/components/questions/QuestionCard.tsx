"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate, truncateText } from "@/lib/date";
import type { Doc } from "@/../convex/_generated/dataModel";

interface QuestionCardProps {
  question: Doc<"questions">;
  onViewRelated?: () => void;
  relatedCount?: number;
}

/**
 * Question card component.
 * Displays question text, creation date, and optional related questions badge.
 */
export function QuestionCard({
  question,
  onViewRelated,
  relatedCount,
}: QuestionCardProps) {
  const displayText = truncateText(question.text, 200);
  const relativeDate = formatRelativeDate(question.createdAt);

  return (
    <Card className="w-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-base font-normal leading-relaxed">
            {displayText}
          </CardTitle>
          {relatedCount !== undefined && relatedCount > 0 && (
            <Badge
              variant="secondary"
              className="cursor-pointer shrink-0"
              onClick={onViewRelated}
            >
              Related ({relatedCount})
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          {relativeDate}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
