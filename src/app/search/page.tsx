"use client";

import { useState, useCallback } from "react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { SignInButton } from "@/components/auth/SignInButton";
import type { Doc } from "@/../convex/_generated/dataModel";

interface SearchResult {
  question: Doc<"questions">;
}

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");

  // Wrap in useCallback to prevent SearchBar useEffect infinite loop
  const handleResults = useCallback((newResults: SearchResult[], query: string) => {
    setResults(newResults);
    setCurrentQuery(query);
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Semantic Search</h1>
          <p className="text-sm text-gray-600">
            Search by meaning, not just keywords.
          </p>
        </div>

        {/* Loading state while auth initializes */}
        <AuthLoading>
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </AuthLoading>

        {/* Unauthenticated state - show sign-in prompt */}
        <Unauthenticated>
          <div className="text-center py-12 space-y-6">
            <p className="text-lg text-gray-600">
              Sign in to search your questions.
            </p>
            <SignInButton />
          </div>
        </Unauthenticated>

        {/* Authenticated state - show search interface */}
        <Authenticated>
          <SearchBar onResults={handleResults} />

          <div className="mt-8">
            <SearchResults results={results} query={currentQuery} />
          </div>
        </Authenticated>
      </div>
    </main>
  );
}
