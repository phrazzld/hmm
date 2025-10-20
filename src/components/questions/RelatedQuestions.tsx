"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/../convex/_generated/api";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatRelativeDate, truncateText } from "@/lib/date";
import { RelatednessIndicator } from "./RelatednessBars";
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
      {/* Inline badge-style trigger */}
      <CollapsibleTrigger asChild>
        <button className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors group/trigger">
          <span className="font-medium">related</span>
          {isOpen ? (
            <ChevronUp className="h-3 w-3 opacity-60" />
          ) : (
            <ChevronDown className="h-3 w-3 opacity-60" />
          )}
        </button>
      </CollapsibleTrigger>

      {/* Inset panel for related questions */}
      <CollapsibleContent className="mt-2">
        {isLoading ? (
          <div className="space-y-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-bg-muted/50 rounded-md animate-pulse" />
            ))}
          </div>
        ) : related.length === 0 ? (
          <p className="text-xs text-text-tertiary italic pl-2">No related questions found yet.</p>
        ) : (
          <div className="bg-bg-subtle/30 rounded-lg p-2.5 border border-border-subtle/50 space-y-1.5">
            {related.map(({ question, score }) => (
              <div
                key={question._id}
                className="group/item flex items-start gap-2.5 p-2 rounded-md hover:bg-bg-surface cursor-pointer transition-colors"
                title="View question"
              >
                {/* Visual strength indicator */}
                <div className="flex-shrink-0 pt-0.5">
                  <RelatednessIndicator score={score} showPercentage />
                </div>

                {/* Question content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-emphasis leading-relaxed">
                    {truncateText(question.text, 100)}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {formatRelativeDate(question.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
