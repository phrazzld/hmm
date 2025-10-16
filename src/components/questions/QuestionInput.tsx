"use client";

import { useState, useTransition, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { validateQuestion, QUESTION_MAX_LENGTH } from "@/lib/validation";
import type { Id } from "@/../convex/_generated/dataModel";

interface QuestionInputProps {
  onQuestionCreated?: (questionId: Id<"questions">) => void;
}

/**
 * Question input with optimistic UI and validation.
 * Shows instant feedback while question is being saved.
 */
export function QuestionInput({ onQuestionCreated }: QuestionInputProps) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const createQuestion = useMutation(api.questions.createQuestion);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate input
    const validation = validateQuestion(text);
    if (!validation.valid) {
      toast({
        variant: "destructive",
        title: "Invalid question",
        description: validation.error,
      });
      return;
    }

    const questionText = text.trim();

    // Optimistic update: clear input immediately
    setText("");

    startTransition(async () => {
      try {
        const questionId = await createQuestion({ text: questionText });
        onQuestionCreated?.(questionId);
      } catch (error) {
        // Restore text on error
        setText(questionText);
        toast({
          variant: "destructive",
          title: "Failed to save question",
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const charsRemaining = QUESTION_MAX_LENGTH - text.length;
  const showCharCount = text.length > QUESTION_MAX_LENGTH * 0.8;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What are you wondering?"
          className="min-h-[120px] resize-none"
          disabled={isPending}
          maxLength={QUESTION_MAX_LENGTH}
        />
        {showCharCount && (
          <div
            className={`absolute bottom-2 right-2 text-xs ${
              charsRemaining < 50 ? "text-red-500" : "text-gray-500"
            }`}
          >
            {charsRemaining}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Press Enter to submit, Shift+Enter for new line
        </p>
        <Button type="submit" disabled={!text.trim() || isPending}>
          {isPending ? "Saving..." : "Ask"}
        </Button>
      </div>
    </form>
  );
}
