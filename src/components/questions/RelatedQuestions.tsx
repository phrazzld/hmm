"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/../convex/_generated/api";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { formatRelativeDate, truncateText } from "@/lib/date";
import type { Id, Doc } from "@/../convex/_generated/dataModel";

interface RelatedQuestionsProps {
  questionId: Id<"questions">;
  limit?: number;
}

/**
 * Related questions component with progressive disclosure.
 * Fetches related questions only when expanded (lazy loading).
 */
export function RelatedQuestions({ questionId, limit = 5 }: RelatedQuestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const getRelated = useAction(api.actions.search.getRelatedQuestions);
  const [related, setRelated] = useState<Array<{ question: Doc<"questions">; score: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (open: boolean) => {
    setIsOpen(open);

    // Lazy load: fetch only on first open
    if (open && !hasFetched) {
      setIsLoading(true);
      try {
        const results = await getRelated({ questionId, limit });
        setRelated(results);
        setHasFetched(true);
      } catch (error) {
        console.error("Failed to fetch related questions:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          <span>Related questions</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-bg-muted rounded-garden-sm animate-pulse border border-border-subtle"
              />
            ))}
          </div>
        ) : related.length === 0 ? (
          <p className="text-xs text-text-tertiary italic">No related questions found yet.</p>
        ) : (
          <div className="space-y-2 pl-4">
            {related.map(({ question, score }) => {
              const scorePercentage = Math.round(score * 100);
              const isWeaklyRelated = score < 0.5;

              return (
                <div
                  key={question._id}
                  className="text-sm p-2 rounded-garden-sm hover:bg-bg-subtle cursor-pointer transition-colors"
                  title={`${scorePercentage}% similar`}
                >
                  <p className="text-text-emphasis leading-relaxed">
                    {truncateText(question.text, 120)}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-text-tertiary">
                        {formatRelativeDate(question.createdAt)}
                      </p>
                      {isWeaklyRelated && (
                        <span className="text-xs text-text-tertiary italic">· loosely related</span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-text-secondary">
                      {scorePercentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
