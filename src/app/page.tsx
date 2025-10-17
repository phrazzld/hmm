"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { QuestionInput } from "@/components/questions/QuestionInput";
import { QuestionList } from "@/components/questions/QuestionList";
import { SignInButton } from "@/components/auth/SignInButton";

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
              Sign in to ask questions and explore your curiosity.
            </p>
            <SignInButton />
          </div>
        </Unauthenticated>

        {/* Authenticated state - show question interface */}
        <Authenticated>
          <QuestionInput />

          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Your Questions</h2>
            <QuestionList />
          </div>
        </Authenticated>
      </div>
    </main>
  );
}
