"use client";

import { useState, useCallback } from "react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { QuestionList } from "@/components/questions/QuestionList";
import { SignInButton } from "@/components/auth/SignInButton";
import { Sparkles } from "lucide-react";
import type { Doc } from "@/../convex/_generated/dataModel";

interface SearchResult {
  question: Doc<"questions">;
  score: number;
}

export default function QuestionsPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");

  // Wrap in useCallback to prevent SearchBar useEffect infinite loop
  const handleResults = useCallback((newResults: SearchResult[], query: string) => {
    setResults(newResults);
    setCurrentQuery(query);
  }, []);

  const hasSearchQuery = currentQuery.trim().length > 0;

  return (
    <main className="relative min-h-[calc(100vh-80px)]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gradient-start/30 via-transparent to-gradient-end/20 pointer-events-none" />

      <div className="relative container mx-auto px-6 py-12 max-w-[780px]">
        <div className="space-y-8">
          {/* Loading state with gentle animation */}
          <AuthLoading>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center gap-2 text-text-secondary">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="font-medium">Loading...</span>
              </div>
            </motion.div>
          </AuthLoading>

          {/* Unauthenticated state */}
          <Unauthenticated>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 space-y-8"
            >
              <div className="space-y-4">
                <div className="text-6xl">🌱</div>
                <p className="text-lg text-text-primary max-w-sm mx-auto leading-relaxed font-serif">
                  Sign in to view your questions
                </p>
                <p className="text-text-secondary">Ask questions, explore connections</p>
              </div>
              <SignInButton />
            </motion.div>
          </Unauthenticated>

          {/* Authenticated state - unified exploration space */}
          <Authenticated>
            {/* Header with search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-serif font-semibold text-text-emphasis tracking-tight">
                  Questions
                </h1>
                <p className="text-sm text-text-secondary">
                  {hasSearchQuery
                    ? "Search by meaning, not just keywords"
                    : "All your questions, in one place"}
                </p>
              </div>

              <SearchBar onResults={handleResults} />
            </motion.div>

            {/* Content: Search results or chronological list */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12"
            >
              {hasSearchQuery ? (
                <SearchResults results={results} query={currentQuery} />
              ) : (
                <QuestionList />
              )}
            </motion.div>
          </Authenticated>
        </div>
      </div>
    </main>
  );
}
