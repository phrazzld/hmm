"use client";

import { QuestionInput } from "@/components/questions/QuestionInput";
import { QuestionList } from "@/components/questions/QuestionList";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">What are you wondering?</h1>
          <p className="text-sm text-gray-600">
            Ask questions, explore connections, follow curiosity.
          </p>
        </div>

        {/* Question Input */}
        <QuestionInput />

        {/* Question List */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Your Questions</h2>
          <QuestionList />
        </div>
      </div>
    </main>
  );
}
