"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { motion } from "framer-motion";
import { QuestionInput } from "@/components/questions/QuestionInput";
import { SignInButton } from "@/components/auth/SignInButton";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-[calc(100vh-80px)]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gradient-start/30 via-transparent to-gradient-end/20 pointer-events-none" />

      <div className="relative container mx-auto px-6 py-16 max-w-[680px]">
        <div className="space-y-12">
          {/* Header with refined typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4 pt-8"
          >
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-text-emphasis tracking-tight leading-tight">
              What are you wondering?
            </h1>
            <p className="text-base text-text-secondary max-w-md mx-auto leading-relaxed">
              Ask questions, explore connections, follow curiosity.
            </p>
          </motion.div>

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

          {/* Unauthenticated state - inviting prompt */}
          <Unauthenticated>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-20 space-y-8"
            >
              <div className="space-y-4">
                <div className="text-6xl">🌱</div>
                <p className="text-lg text-text-primary max-w-sm mx-auto leading-relaxed font-serif">
                  Sign in to get started
                </p>
                <p className="text-text-secondary">
                  Ask questions, explore connections
                </p>
              </div>
              <SignInButton />
            </motion.div>
          </Unauthenticated>

          {/* Authenticated state - focused question input */}
          <Authenticated>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="py-8"
            >
              <QuestionInput />
            </motion.div>
          </Authenticated>
        </div>
      </div>
    </main>
  );
}
