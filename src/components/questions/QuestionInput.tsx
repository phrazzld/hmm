"use client";

import { useState, useTransition, FormEvent, useRef } from "react";
import { useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { validateQuestion, QUESTION_MAX_LENGTH } from "@/lib/validation";
import { Sprout, Loader2, Check } from "lucide-react";
import type { Id } from "@/../convex/_generated/dataModel";

interface QuestionInputProps {
  onQuestionCreated?: (questionId: Id<"questions">) => void;
}

/**
 * Question input with smooth animations.
 */
export function QuestionInput({ onQuestionCreated }: QuestionInputProps) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createQuestion = useMutation(api.questions.createQuestion);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validation = validateQuestion(text);
    if (!validation.valid) {
      toast({
        variant: "destructive",
        title: "Invalid question",
        description: validation.error,
      });
      textareaRef.current?.focus();
      return;
    }

    const questionText = text.trim();
    setText("");

    // Maintain focus after clearing - must happen after React renders
    setTimeout(() => textareaRef.current?.focus(), 0);

    startTransition(async () => {
      try {
        const questionId = await createQuestion({ text: questionText });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        onQuestionCreated?.(questionId);
      } catch (error) {
        setText(questionText);
        toast({
          variant: "destructive",
          title: "Failed to save question",
          description: error instanceof Error ? error.message : "Unknown error",
        });
        textareaRef.current?.focus();
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const charsRemaining = QUESTION_MAX_LENGTH - text.length;
  const showCharCount = text.length > QUESTION_MAX_LENGTH * 0.8;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Simplified flat textarea design */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          maxLength={QUESTION_MAX_LENGTH}
          className="
            w-full min-h-[140px]
            px-6 py-6
            bg-bg-surface
            border border-border-subtle
            rounded-garden-lg
            text-text-emphasis text-base leading-relaxed
            placeholder:text-text-tertiary placeholder:font-serif
            resize-none
            outline-none
            transition-all duration-200
            focus:border-border-emphasis focus:ring-2 focus:ring-border-emphasis/20
          "
        />

        <AnimatePresence>
          {showCharCount && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`absolute bottom-4 right-4 text-xs font-medium ${
                charsRemaining < 50 ? "text-accent" : "text-text-tertiary"
              }`}
            >
              {charsRemaining}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action bar */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-text-tertiary font-medium">
          Press <kbd className="px-1.5 py-0.5 rounded bg-bg-subtle text-text-primary font-mono text-xs">Enter</kbd> to save · <kbd className="px-1.5 py-0.5 rounded bg-bg-subtle text-text-primary font-mono text-xs">Shift + Enter</kbd> for new line
        </p>

        <motion.button
          type="submit"
          disabled={!text.trim() || isPending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-interactive-primary text-interactive-primary-foreground font-medium text-sm shadow-garden-sm hover:bg-interactive-hover hover:shadow-garden-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 w-[180px] justify-center"
        >
          <AnimatePresence mode="popLayout">
            {isPending ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
              </motion.div>
            ) : showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <Check className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              >
                <Sprout className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
          <span>
            {isPending ? "Saving..." : showSuccess ? "Saved!" : "Save"}
          </span>
        </motion.button>
      </div>
    </form>
  );
}
