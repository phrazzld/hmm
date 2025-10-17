# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**hmm** is a semantic question journaling application — "a place for curiosity powered by meaning, not metadata." Users ask questions, and the system discovers relationships between them using vector embeddings rather than manual tagging or categorization.

**Core Principle:** Users never organize anything manually. The system understands relationships between thoughts through semantic similarity.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui (Radix primitives)
- **Backend:** Convex (real-time database + serverless functions)
- **Auth:** Clerk (via `@clerk/nextjs`)
- **AI:** OpenAI API (`text-embedding-3-small` for 1536-dimensional embeddings)
- **Package Manager:** pnpm (enforced via preinstall hook)
- **Deployment:** Vercel

## Development Commands

```bash
# Install dependencies (pnpm enforced)
pnpm install

# Development (runs both Next.js and Convex concurrently)
pnpm dev

# Run only Next.js (when Convex is already running)
pnpm dev:next-only

# Run only Convex (when Next.js is already running)
pnpm dev:convex-only

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Architecture

### Authentication Flow

1. **Clerk** manages user authentication (JWT-based)
2. **Middleware** (`src/middleware.ts`) protects all routes except `/sign-in` and `/sign-up`
3. **Convex** validates Clerk JWTs via `convex/auth.config.ts`
4. User records created lazily in Convex on first question

### Data Model (Convex)

**users**
- `clerkId`: Stable Clerk identifier
- `email`, `name`, `createdAt`
- Indexed by `clerkId`

**questions**
- `userId`, `text`, `createdAt`, `updatedAt`
- Indexed by `userId` and `(userId, createdAt)`
- Core entity; embeddings stored separately

**embeddings**
- `questionId`, `embedding` (1536 float64 array), `model`, `createdAt`
- Vector index on `embedding` field (1536 dimensions)
- Indexed by `questionId`

### Key Flows

**Creating a Question**
1. Client calls `questions.createQuestion(text)` mutation
2. Question inserted immediately (optimistic UI)
3. Scheduler enqueues `actions/embeddings.generateEmbedding`
4. Action fetches question → calls OpenAI → stores embedding

**Semantic Search**
1. Client calls `actions/search.semanticSearch(query)` action
2. Query embedding generated via OpenAI
3. Vector search on `embeddings.by_embedding` index
4. Results hydrated with question data, filtered by current user

**Related Questions**
1. Client calls `actions/search.getRelatedQuestions(questionId)` action
2. Fetch question's embedding
3. Vector search for similar embeddings
4. Filter out self, hydrate, return top-k

### Convex Organization

- **Mutations:** `convex/questions.ts` (user-facing mutations)
- **Queries:** `convex/questions.ts` (user-facing queries)
- **Actions:** `convex/actions/` (Node.js runtime, external API calls)
  - `embeddings.ts`: Generate embeddings via OpenAI
  - `search.ts`: Semantic search and related questions
- **Internal:** `convex/embeddings.ts` (internal mutations/queries)
- **Lib:** `convex/lib/` (utilities)
  - `auth.ts`: Authentication helpers
  - `openai.ts`: OpenAI client singleton
  - `retry.ts`: Retry logic for API calls

**Important:** Actions use `"use node"` directive and can only call external APIs. Mutations/queries run in Convex runtime and cannot call external APIs.

### Frontend Patterns

**Providers** (`src/components/providers/ConvexClientProvider.tsx`)
- Wraps app with Clerk + Convex + useAuth integration
- Convex URL from `NEXT_PUBLIC_CONVEX_URL`

**Component Structure**
- `src/app/`: Next.js App Router pages
- `src/components/`: Organized by domain
  - `auth/`: SignInButton, UserButton
  - `questions/`: QuestionInput, QuestionList, QuestionCard
  - `search/`: SearchBar, SearchResults
  - `ui/`: shadcn/ui components

**State Management**
- Convex real-time subscriptions via `useQuery` and `useMutation`
- Optimistic UI: questions render immediately, embeddings stream in

## Environment Variables

**Local Development:**
```bash
# .env.local (Next.js)
NEXT_PUBLIC_CONVEX_URL=        # From `npx convex dev`
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=       # e.g., sunny-sheep-42.clerk.accounts.dev
```

**Convex Deployment:**
```bash
npx convex env set <deployment> OPENAI_API_KEY <key>
npx convex env set <deployment> CLERK_JWT_ISSUER_DOMAIN <domain>
```

## Key Patterns

### Lazy OpenAI Client Initialization
`convex/lib/openai.ts` uses singleton pattern to defer API key validation until runtime (allows Convex to deploy without local env vars).

### Internal vs External Functions
- **Internal functions** (`internalMutation`, `internalQuery`, `internalAction`): Cannot be called from client; use `internal.*` imports
- **External functions** (`mutation`, `query`, `action`): Client-callable; require auth checks

### Retry Logic
All OpenAI API calls wrapped with `withRetry` (exponential backoff) to handle transient failures.

### Type Safety
- Convex auto-generates types in `convex/_generated/`
- Use `Doc<"tableName">` and `Id<"tableName">` from `convex/_generated/dataModel`
- Actions require type assertions for nested function imports (e.g., `(internal as any)["actions/embeddings"]`)

## Common Tasks

### Add a New UI Component
```bash
npx shadcn@latest add <component-name>
```
Components installed to `src/components/ui/` with Tailwind config.

### Add a New Convex Function
1. Create in appropriate file (`queries.ts`, `mutations.ts`, or `actions/`)
2. Export with typed args: `export const foo = mutation({ args: { ... }, handler: ... })`
3. Import in client via `api.*` or `internal.*`
4. Convex regenerates types automatically

### Run Type Checking
```bash
pnpm type-check  # Checks both Next.js and Convex codebases
```

### Debug Convex Functions
- View logs in Convex dashboard
- Use `console.log` in actions (logged to dashboard)
- Use Convex Dev Tools browser extension

## Design Philosophy

### Simplicity Over Features
- Single text input for asking questions
- No manual tags, folders, or organization
- Semantic relationships discovered automatically

### Privacy First
- User data scoped by `userId` in all queries
- Auth checks in every user-facing function
- Vector search filtered by current user

### Optimistic UI
- Questions appear instantly on submit
- Background enrichment (embeddings) streams in
- Loading states minimal and non-blocking

## Current State

**Implemented:**
- User authentication (Clerk)
- Question creation with async embedding generation
- Semantic search across user's questions
- Related questions (vector similarity)
- Basic question list view
- Search interface

**Future Phases:**
- Clustering (auto-generated themes)
- Follow-up question generation
- Multi-voice answers (Socratic, poetic, scientific)
- Proactive nudges ("questions you asked last month")
- Curiosity analytics

## Troubleshooting

**Convex types out of sync:**
```bash
# Restart Convex dev server
npx convex dev
```

**OpenAI API errors:**
- Check `OPENAI_API_KEY` set in Convex dashboard
- Verify retry logic in `convex/lib/retry.ts`

**Auth issues:**
- Ensure `CLERK_JWT_ISSUER_DOMAIN` matches Clerk dashboard
- Check middleware matcher in `src/middleware.ts`

**Vector search not working:**
- Confirm embeddings table has `vectorIndex` defined
- Verify embedding dimensions match model (1536 for `text-embedding-3-small`)
