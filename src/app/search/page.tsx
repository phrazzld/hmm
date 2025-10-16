"use client";

import { useState } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import type { Id } from "@/../convex/_generated/dataModel";

interface SearchResult {
  question: {
    _id: Id<"questions">;
    text: string;
    createdAt: number;
    userId: Id<"users">;
    updatedAt: number;
  };
}

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");

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

        {/* Search Bar */}
        <SearchBar
          onResults={(newResults, query) => {
            setResults(newResults);
            setCurrentQuery(query);
          }}
        />

        {/* Results */}
        <div className="mt-8">
          <SearchResults results={results} query={currentQuery} />
        </div>
      </div>
    </main>
  );
}
