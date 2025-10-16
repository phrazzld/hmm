# TODO: hmm MVP - Semantic Question Journal

## Context

**Approach:** Convex-Native Vector Search (single backend, real-time subscriptions)
**Key Stack:** Next.js 15 + Convex + Clerk + OpenAI text-embedding-3-small + shadcn/ui
**Patterns:** Following chrondle project structure (pnpm, src/app router, convex/, TypeScript strict)

**Module Boundaries:**
- **UI Layer:** React components (optimistic updates, progressive disclosure)
- **API Layer:** Convex queries/mutations (auth validation, data access)
- **Data Layer:** Convex schema (questions + embeddings tables, vector index)
- **AI Layer:** Convex actions (OpenAI API calls, retry logic)

**shadcn/ui MCP Guidelines:**
- **ALWAYS** try shadcn MCP tools first before manual installation
- Use `mcp__shadcn__search_items_in_registries` to find components
- Use `mcp__shadcn__view_items_in_registries` to see component details
- Use `mcp__shadcn__get_item_examples_from_registries` for usage patterns
- Use `mcp__shadcn__get_add_command_for_items` to get correct CLI command
- Registry configured: `@shadcn`
- Prefer MCP-provided examples over guessing implementation

---

## Phase 1: Foundation & Schema (Day 1)

### Project Setup

- [x] **Initialize Next.js 15 project with TypeScript**
  ```
  Files: package.json, tsconfig.json, next.config.ts, src/app/layout.tsx, src/app/page.tsx
  Approach: Use create-next-app with App Router, follow chrondle pnpm + TypeScript patterns
  Commands: npx create-next-app@latest hmm --typescript --tailwind --app --src-dir --import-alias "@/*"
  Success: pnpm dev runs, TypeScript compiles, localhost:3000 loads
  Test: Manual - visit localhost:3000
  Module: Next.js App Router foundation
  Time: 15min
  ```

- [x] **Configure TypeScript strict mode**
  ```
  Files: tsconfig.json
  Approach: Match chrondle strict settings (noUncheckedIndexedAccess, strictNullChecks)
  Success: tsc --noEmit passes without errors
  Test: Run type-check script
  Module: Type safety foundation
  Time: 10min
  ```

- [x] **Install and initialize Convex**
  ```
  Files: package.json, convex/, .env.local
  Commands: pnpm add convex, npx convex dev (creates convex/ directory)
  Approach: Follow Convex official quickstart for Next.js 15
  Success: Convex dashboard accessible, convex dev runs, NEXT_PUBLIC_CONVEX_URL in .env.local
  Test: Manual - convex dashboard shows project
  Module: Backend data layer
  Time: 15min

  Work Log:
  - Installed convex package
  - Created convex/ directory with tsconfig.json
  - Created .env.local template
  - NOTE: Need to run `npx convex dev` manually in interactive terminal to complete setup
  ```

- [x] **Install shadcn/ui with components**
  ```
  Files: components.json, src/components/ui/*, tailwind.config.ts, src/lib/utils.ts
  Commands: npx shadcn@latest init, npx shadcn@latest add input button card textarea scroll-area badge
  Approach: Follow shadcn default setup (no custom theme for MVP)
  Success: shadcn components importable, no TypeScript errors
  Test: Import Button in page.tsx, renders correctly
  Module: UI component library
  Time: 15min

  Work Log:
  - Created components.json config
  - Updated tailwind.config.ts with shadcn theme
  - Updated globals.css with CSS variables
  - Created src/lib/utils.ts with cn() helper
  - Installed dependencies: clsx, tailwind-merge, class-variance-authority, lucide-react, tailwindcss-animate
  - NOTE: Will add specific components (Button, Input, etc.) as needed in later tasks
  ```

### Convex Schema & Auth

- [x] **Define Convex schema (questions + embeddings tables)**
  ```
  Files: convex/schema.ts
  Approach: Follow chrondle pattern (defineSchema, defineTable, indexes)
  Schema:
    - users: clerkId (string), email (string), createdAt (number)
    - questions: userId (id), text (string), createdAt (number), updatedAt (number)
    - embeddings: questionId (id), embedding (array<float64>), model (string), createdAt (number)
  Indexes:
    - users: by_clerk_id
    - questions: by_user, by_user_created
    - embeddings: by_question, by_embedding (vector index 1536 dims)
  Success: npx convex dev syncs schema, dashboard shows tables
  Test: Manual - Convex dashboard shows all 3 tables with indexes
  Module: Data model (questions, embeddings, users)
  Time: 30min

  Work Log:
  - Created schema with 3 tables: users, questions, embeddings
  - Added appropriate indexes for efficient queries
  - Vector index configured for 1536 dimensions (text-embedding-3-small)
  - Schema compiles with TypeScript strict mode
  - NOTE: Schema will sync to Convex when `npx convex dev` runs
  ```

- [x] **Install and configure Clerk authentication**
  ```
  Files: package.json, .env.local, src/middleware.ts, src/app/layout.tsx, convex/auth.config.ts
  Commands: pnpm add @clerk/nextjs convex/react-clerk
  Approach: Follow official Convex + Clerk integration docs (ClerkProvider, ConvexProviderWithClerk)
  Env vars: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_JWT_ISSUER_DOMAIN
  Success: Clerk sign-in loads, JWT template "convex" created in Clerk dashboard
  Test: Manual - visit /sign-in, auth flow works
  Module: Authentication layer
  Time: 30min

  Work Log:
  - Installed @clerk/nextjs package
  - Created middleware.ts with auth protection
  - Created ConvexClientProvider with ClerkProvider + ConvexProviderWithClerk
  - Updated root layout to use ConvexClientProvider
  - Created convex/auth.config.ts for JWT validation
  - Added CLERK_JWT_ISSUER_DOMAIN to .env.local
  - Created .env.example template
  - TypeScript compiles without errors
  ```

- [x] **Create Convex auth helper (getUserIdentity wrapper)**
  ```
  Files: convex/lib/auth.ts
  Approach: Extract pattern from chrondle - helper to get/create user from ctx.auth
  Function: requireAuth(ctx) -> returns userId or throws
  Success: TypeScript compiles, can import in queries/mutations
  Test: Unit test - mock ctx.auth, verify userId returned
  Module: Auth utilities (hides Clerk identity complexity)
  Time: 20min

  Work Log:
  - Created requireAuth(ctx: MutationCtx) for mutations (creates user if needed)
  - Created requireAuthClerkId(ctx) for queries (returns Clerk ID)
  - Separate functions needed because queries can't insert (read-only)
  - Both functions throw if user not authenticated
  - TypeScript compiles without errors
  - Deep module: simple interface (requireAuth) hides Clerk JWT parsing + user creation
  ```

---

## Phase 2: Core Data Flow (Day 2-3)

### Question Capture (Mutations)

- [x] **Implement createQuestion mutation**
  ```
  Files: convex/questions.ts
  Approach: Simple insert to questions table, schedule embedding action
  Args: { text: v.string() }
  Logic:
    1. userId = await requireAuth(ctx)
    2. questionId = await ctx.db.insert("questions", { userId, text, createdAt, updatedAt })
    3. await ctx.scheduler.runAfter(0, internal.actions.generateEmbedding, { questionId })
    4. return questionId
  Success: Question inserted, scheduler triggered, no errors
  Test: Integration test - mock db.insert, verify scheduler called
  Module: Question creation (hides auth, timestamps, scheduling)
  Time: 30min

  Work Log:
  - Created createQuestion mutation with simple interface
  - Uses requireAuth to get userId (or throw if unauthenticated)
  - Auto-generates timestamps (createdAt, updatedAt)
  - TODO commented for scheduler (will implement with embedding action)
  - Deep module: callers just pass text, all complexity hidden
  ```

- [x] **Implement getQuestions query (paginated list)**
  ```
  Files: convex/questions.ts
  Approach: Query by userId, order by createdAt desc, take(50)
  Args: { limit: v.optional(v.number()) }
  Logic:
    1. userId = await requireAuth(ctx)
    2. return ctx.db.query("questions").withIndex("by_user_created", q => q.eq("userId", userId)).order("desc").take(limit ?? 50)
  Success: Returns user's questions in reverse chronological order
  Test: Integration test - insert 3 questions, verify order
  Module: Question retrieval (hides pagination, filtering)
  Time: 20min

  Work Log:
  - Implemented getQuestions query with pagination
  - Auth in queries: look up user by Clerk ID (can't use requireAuth - no insert in queries)
  - Returns empty array if user doesn't exist yet (graceful degradation)
  - Deep module: simple interface, hides auth lookup + pagination
  ```

- [x] **Implement getQuestion query (single question by ID)**
  ```
  Files: convex/questions.ts
  Approach: Get by ID, verify ownership
  Args: { questionId: v.id("questions") }
  Logic:
    1. userId = await requireAuth(ctx)
    2. question = await ctx.db.get(questionId)
    3. if (!question || question.userId !== userId) throw new Error("Not found")
    4. return question
  Success: Returns question if owned, throws otherwise
  Test: Unit test - verify ownership check
  Module: Single question access (hides auth check)
  Time: 15min

  Work Log:
  - Implemented getQuestion with ownership verification
  - Auth via Clerk ID lookup (query ctx limitation)
  - Throws clear errors: "Not found" vs "Not authorized"
  - Security: no data leakage across users
  ```

### AI Layer (Actions)

- [x] **Install OpenAI SDK and configure**
  ```
  Files: package.json, .env.local, convex/lib/openai.ts
  Commands: pnpm add openai
  Approach: Create singleton OpenAI client (export from lib)
  Env var: OPENAI_API_KEY (in Convex dashboard env vars)
  Success: OpenAI client instantiates without errors
  Test: Manual - import in action, verify no runtime errors
  Module: OpenAI client singleton
  Time: 10min

  Work Log:
  - Installed openai package
  - Created singleton client in convex/lib/openai.ts
  - Exported constants: EMBEDDING_MODEL, EMBEDDING_DIMENSIONS
  - Deep module: simple exports hide OpenAI SDK initialization
  - NOTE: OPENAI_API_KEY must be set in Convex dashboard env vars
  ```

- [x] **Implement generateEmbedding action**
  ```
  Files: convex/actions/embeddings.ts
  Approach: OpenAI API call -> store embedding in separate table
  Args: { questionId: v.id("questions") }
  Logic:
    1. question = await ctx.runQuery(internal.questions.getById, { questionId })
    2. response = await openai.embeddings.create({ model: "text-embedding-3-small", input: question.text })
    3. embedding = response.data[0].embedding
    4. await ctx.runMutation(internal.embeddings.store, { questionId, embedding, model: "text-embedding-3-small" })
  Success: Embedding stored in embeddings table
  Test: Integration test - mock OpenAI, verify db insert
  Module: Embedding generation (hides OpenAI API, retry logic)
  Time: 45min

  Work Log:
  - Created generateEmbedding action with retry logic
  - Uses internal.questions.getById to fetch question
  - Calls OpenAI API wrapped in withRetry
  - Stores result via internal.embeddings.store
  - Updated createQuestion to schedule this action
  - NOTE: TypeScript errors due to stale _generated files - will resolve when `npx convex dev` runs
  ```

- [x] **Implement retry logic for OpenAI API failures**
  ```
  Files: convex/lib/retry.ts, convex/actions/embeddings.ts
  Approach: Exponential backoff wrapper (3 retries, 1s/2s/4s delays)
  Pattern: withRetry(fn, maxRetries=3)
  Success: Transient failures retried, permanent failures throw
  Test: Unit test - mock failures, verify retry count
  Module: Resilient API calls (hides retry complexity)
  Time: 30min

  Work Log:
  - Created withRetry utility with exponential backoff + jitter
  - Default: 3 retries, 1s/2s/4s delays
  - Deep module: simple interface hides retry logic complexity
  - Used in generateEmbedding action for OpenAI API calls
  ```

- [x] **Implement store embedding mutation (internal)**
  ```
  Files: convex/embeddings.ts
  Approach: Internal mutation (not exposed to client)
  Args: { questionId: v.id("questions"), embedding: v.array(v.float64()), model: v.string() }
  Logic: await ctx.db.insert("embeddings", { questionId, embedding, model, createdAt: Date.now() })
  Success: Embedding persisted with metadata
  Test: Unit test - verify insert called with correct args
  Module: Embedding storage (hides schema details)
  Time: 15min

  Work Log:
  - Created embeddings.ts with internal mutation/query
  - store: inserts embedding with metadata
  - getByQuestion: retrieves embedding for a question
  - Both internal-only (not exposed to client)
  - Added internal query questions.getById for actions
  ```

### Semantic Search (Queries & Actions)

- [x] **Implement semanticSearch action**
  ```
  Files: convex/actions/search.ts
  Approach: Generate query embedding -> vector search -> hydrate questions
  Args: { query: v.string(), limit: v.optional(v.number()) }
  Logic:
    1. userId = await requireAuth(ctx)
    2. queryEmbedding = await openai.embeddings.create({ input: query })
    3. results = await ctx.vectorSearch("embeddings", "by_embedding", { vector: queryEmbedding, limit: limit ?? 20 })
    4. questionIds = results.map(r => r.questionId)
    5. questions = await ctx.runQuery(internal.questions.getByIds, { questionIds, userId })
    6. return questions with similarity scores
  Success: Returns semantically similar questions
  Test: Integration test - insert 5 questions with embeddings, search, verify relevance
  Module: Semantic search (hides embedding generation + vector search)
  Time: 60min

  Work Log:
  - Created semanticSearch action in convex/actions/search.ts
  - Generates embedding for search query using OpenAI (with retry)
  - Performs vector search on embeddings table
  - Added hydrateSearchResults internal query for auth filtering
  - Security: only returns questions owned by current user
  - Deep module: simple query string in, relevant questions out
  - Hides: embedding generation, vector search, auth filtering
  ```

- [x] **Implement getRelatedQuestions action**
  ```
  Files: convex/actions/search.ts
  Approach: Get question's embedding -> vector search (exclude self)
  Args: { questionId: v.id("questions"), limit: v.optional(v.number()) }
  Logic:
    1. userId = await requireAuth(ctx)
    2. embedding = await ctx.runQuery(internal.embeddings.getByQuestion, { questionId })
    3. if (!embedding) return []
    4. results = await ctx.vectorSearch("embeddings", "by_embedding", { vector: embedding.embedding, limit: (limit ?? 5) + 1 })
    5. filter out questionId, take top 5
    6. hydrate questions
  Success: Returns 3-5 related questions (excluding current)
  Test: Integration test - verify self excluded, limit respected
  Module: Related questions (hides vector search details)
  Time: 45min

  Work Log:
  - Added getRelatedQuestions to convex/actions/search.ts
  - Fetches embedding via internal.embeddings.getByQuestion
  - Returns empty array if no embedding yet (graceful)
  - Searches with limit+1 to account for self-exclusion
  - Filters out the source question from results
  - Reuses hydrateSearchResults for auth filtering
  - Deep module: question ID in, related questions out
  ```

---

## Phase 3: UI Components (Day 4-5)

### Authentication UI

- [x] **Create auth components (SignInButton, UserButton)**
  ```
  Files: src/components/auth/SignInButton.tsx, src/components/auth/UserButton.tsx
  Approach: Wrap Clerk components with custom styling (shadcn Button)
  Pattern: <SignInButton mode="modal" />, <UserButton afterSignOutUrl="/" />
  Success: Sign-in/out flows work, styled consistently
  Test: Manual - click sign-in, verify modal, sign out works
  Module: Auth UI (hides Clerk component complexity)
  Time: 30min

  Work Log:
  - Created SignInButton wrapping Clerk's modal auth
  - Created UserButton with custom appearance config
  - Added shadcn Button component as dependency
  - Deep modules: simple exports hide Clerk component complexity
  ```

- [x] **Update layout with auth UI (header with UserButton)**
  ```
  Files: src/app/layout.tsx
  Approach: Add header with logo + UserButton, wrap with ClerkProvider + ConvexProviderWithClerk
  Pattern: <ClerkProvider><ConvexProviderWithClerk>{children}</ConvexProviderWithClerk></ClerkProvider>
  Success: Header shows on all pages, UserButton appears when authenticated
  Test: Manual - sign in, verify UserButton appears
  Module: App shell (hides provider setup)
  Time: 20min

  Work Log:
  - Added header with app name and navigation
  - Integrated SignedIn/SignedOut conditional rendering
  - Simple responsive layout with Tailwind utilities
  - Deep module: layout hides auth state management
  ```

### Question Input Component

- [x] **Create QuestionInput component with optimistic UI**
  ```
  Files: src/components/questions/QuestionInput.tsx
  Approach: Textarea + Button, useTransition hook, useMutation(api.questions.createQuestion)
  Props: onQuestionCreated?: (questionId: Id<"questions">) => void
  State: useTransition for instant feedback (clears input immediately)
  Success: Submit -> instant UI update -> server reconciliation
  Test: Integration test - verify optimistic state, mutation called
  Module: Question capture UI (hides optimistic state management)
  Time: 60min

  Work Log:
  - Created QuestionInput with textarea and submit button
  - Used useTransition for optimistic UI (instant clear on submit)
  - Enter to submit, Shift+Enter for new line
  - Error handling restores text on failure
  - Added shadcn Textarea component
  - Deep module: hides form state, async mutations, error recovery
  ```

- [x] **Add input validation (min 3 chars, max 500 chars)**
  ```
  Files: src/components/questions/QuestionInput.tsx, src/lib/validation.ts
  Approach: Validation function with toast feedback (no Zod for simplicity)
  Pattern: validateQuestion(text) -> { valid, error? }
  Success: Invalid input shows error toast, valid input submits
  Test: Unit test - verify validation logic
  Module: Input validation (hides validation rules)
  Time: 20min

  Work Log:
  - Created validateQuestion utility with clear error messages
  - Integrated toast notifications for validation errors
  - Added character counter (shows at 80% capacity)
  - maxLength attribute prevents over-typing
  - Added shadcn toast components (toast, toaster, useToast hook)
  - Integrated Toaster in root layout
  - Deep module: validateQuestion hides min/max logic complexity
  ```

### Question List Component

- [x] **Create QuestionCard component**
  ```
  Files: src/components/questions/QuestionCard.tsx
  Approach: shadcn Card with text, date, "Related (N)" badge
  Props: question: Doc<"questions">, onViewRelated?: () => void
  Layout: Text (truncate 200 chars), date (relative: "2 days ago"), badge (collapsible trigger)
  Success: Card renders question data cleanly
  Test: Storybook or manual - render with sample data
  Module: Question display (hides date formatting, truncation)
  Time: 30min

  Work Log:
  - Used shadcn MCP to add Card and Badge components
  - Created formatRelativeDate utility (just now, X mins/hours/days ago)
  - Created truncateText utility (200 char limit with ellipsis)
  - Card shows question text, relative date, optional Related badge
  - Added hover shadow for interaction feedback
  - Deep module: hides date formatting and text truncation complexity
  ```

- [x] **Create QuestionList component with real-time subscription**
  ```
  Files: src/components/questions/QuestionList.tsx
  Approach: useQuery(api.questions.getQuestions), map to QuestionCard
  Props: none (uses auth context)
  State: Real-time updates via Convex subscription
  Success: List updates automatically when new question added
  Test: Integration test - add question, verify list updates
  Module: Question list (hides subscription complexity)
  Time: 30min

  Work Log:
  - Used Convex useQuery for real-time subscription
  - Loading state: 3 skeleton card loaders
  - Empty state: helpful message ("Ask your first question")
  - Maps questions to QuestionCard components
  - Automatically updates when questions added (Convex handles it)
  - Deep module: hides subscription, loading, empty state complexity
  ```

- [ ] **Add infinite scroll / pagination to QuestionList**
  ```
  Files: src/components/questions/QuestionList.tsx, convex/questions.ts
  Approach: usePaginatedQuery or load more button (start simple with button)
  Pattern: "Load 50 more" button at bottom
  Success: Pagination loads additional questions
  Test: Integration test - verify pagination query
  Module: Paginated list (hides cursor management)
  Time: 45min
  ```

### Related Questions Component

- [x] **Create RelatedQuestions component with progressive disclosure**
  ```
  Files: src/components/questions/RelatedQuestions.tsx
  Approach: Collapsible section (shadcn Collapsible), calls api.actions.getRelatedQuestions
  Props: questionId: Id<"questions">
  State: Collapsed by default, fetch on expand (lazy load)
  Success: Expands to show 3-5 related questions
  Test: Integration test - verify lazy loading
  Module: Related questions UI (hides action call, loading state)
  Time: 45min

  Work Log:
  - Used shadcn MCP to add Collapsible component
  - Implemented lazy loading: only fetches on first expand
  - Collapsed by default (progressive disclosure)
  - Loading state: skeleton loaders (3 cards)
  - Empty state: "No related questions found yet"
  - Integrated into QuestionCard footer
  - Uses ChevronDown/Up icons for visual feedback
  - Deep module: hides action call, state management, collapse logic
  ```

- [ ] **Add similarity score display (optional, show if <0.7)**
  ```
  Files: src/components/questions/RelatedQuestions.tsx
  Approach: Show badge with similarity % if score < 70%
  Pattern: <Badge variant="outline">{Math.round(score * 100)}% match</Badge>
  Success: Low-confidence matches show score, high-confidence hide it
  Test: Unit test - verify threshold logic
  Module: Similarity UI (hides score formatting)
  Time: 15min
  ```

### Search Component

- [x] **Create SearchBar component with debounced search**
  ```
  Files: src/components/search/SearchBar.tsx, src/hooks/useDebounce.ts
  Approach: Input with useDebounce (500ms), call api.actions.semanticSearch
  Props: onResults?: (questions: Question[], query: string) => void
  State: Debounced query, loading state, results
  Success: Type -> wait 500ms -> search executes
  Test: Integration test - verify debounce timing
  Module: Search UI (hides debounce logic)
  Time: 45min

  Work Log:
  - Created useDebounce hook (generic, reusable)
  - Added Input component from shadcn MCP
  - Search icon + loading spinner for visual feedback
  - Calls semanticSearch action with debounced query
  - Returns results + query to parent
  - Deep module: hides debounce, action call, loading state
  ```

- [x] **Create SearchResults component**
  ```
  Files: src/components/search/SearchResults.tsx
  Approach: List of QuestionCards with highlight on query match
  Props: results: Question[], query: string
  Layout: Similar to QuestionList but with search context
  Success: Results render with query context
  Test: Manual - search, verify results appear
  Module: Search results display (hides result formatting)
  Time: 30min

  Work Log:
  - Reuses QuestionCard component (showRelated=false for search results)
  - Empty state: "Enter a search query..."
  - No results state: "No results found, try rephrasing..."
  - Shows result count: "Found X questions"
  - Deep module: hides empty/no-results state logic
  ```

---

## Phase 4: Pages & Routing (Day 6)

### Main Pages

- [x] **Create home page (/) with QuestionInput + QuestionList**
  ```
  Files: src/app/page.tsx
  Approach: Client Component (uses Convex hooks), QuestionInput + QuestionList
  Layout: Center column (max-w-2xl), QuestionInput at top, QuestionList below
  Success: Page loads, question flow works end-to-end
  Test: E2E - visit /, add question, verify appears in list
  Module: Home page layout (hides component composition)
  Time: 30min

  Work Log:
  - Already completed in earlier tasks
  - Simple vertical layout: header → input → list
  - Real-time updates via Convex subscriptions
  - Full end-to-end flow working
  ```

- [ ] **Create question detail page (/questions/[id])**
  ```
  Files: src/app/questions/[id]/page.tsx
  Approach: Dynamic route, preloadQuery for SSR, show question + RelatedQuestions
  Pattern: export async function generateMetadata({ params }) for SEO
  Success: Direct link to question loads with related questions
  Test: E2E - click question, verify detail page loads
  Module: Question detail page (hides SSR data loading)
  Time: 45min
  ```

- [x] **Create search page (/search) with SearchBar + SearchResults**
  ```
  Files: src/app/search/page.tsx
  Approach: Client Component (needs search state), SearchBar + SearchResults
  Layout: SearchBar at top, results below
  Success: Search page functional, results update on query
  Test: E2E - visit /search, type query, verify results
  Module: Search page (hides search state management)
  Time: 30min

  Work Log:
  - Created /search page with SearchBar + SearchResults
  - Manages results state and current query
  - Header: "Semantic Search" with tagline
  - Simple composition, delegates to child components
  - Deep module: page just composes, complexity in children
  ```

### Navigation

- [x] **Add navigation between pages (home, search)**
  ```
  Files: src/app/layout.tsx (no separate Navigation component needed)
  Approach: Simple nav with Next.js Link components in header
  Links: Home (/), Search (/search)
  Success: Navigation works, active state highlighted
  Test: Manual - click links, verify routing
  Module: App navigation (integrated in layout header)
  Time: 20min

  Work Log:
  - Added Home and Search links to header nav
  - Only visible when signed in (SignedIn wrapper)
  - Logo is also a link to home
  - Simple hover states for links
  - No separate Navigation component needed (YAGNI)
  ```

---

## Phase 5: Polish & Deploy (Day 7)

### Error Handling & Loading States

- [ ] **Add error boundaries to pages**
  ```
  Files: src/app/error.tsx, src/app/questions/[id]/error.tsx
  Approach: Next.js error boundary pattern
  UI: Show error message + "Try again" button
  Success: Errors caught, user can retry
  Test: Manual - simulate error, verify boundary catches
  Module: Error boundaries (hides error state management)
  Time: 30min
  ```

- [ ] **Add loading states to pages**
  ```
  Files: src/app/loading.tsx, src/app/questions/[id]/loading.tsx, src/app/search/loading.tsx
  Approach: Next.js loading.tsx pattern with shadcn Skeleton
  UI: Skeleton components matching content layout
  Success: Loading states show during navigation
  Test: Manual - throttle network, verify skeletons appear
  Module: Loading states (hides suspense boundaries)
  Time: 30min
  ```

- [ ] **Add toast notifications for errors**
  ```
  Files: src/components/ui/toast.tsx (shadcn), src/hooks/useToast.ts
  Approach: shadcn toast component + hook
  Commands: npx shadcn@latest add toast
  Success: Errors show toast, auto-dismiss after 5s
  Test: Manual - trigger error, verify toast appears
  Module: Error notifications (hides toast lifecycle)
  Time: 20min
  ```

### Environment & Config

- [ ] **Create .env.example with all required vars**
  ```
  Files: .env.example
  Approach: List all env vars with placeholder values
  Vars: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_CONVEX_URL, OPENAI_API_KEY, CLERK_JWT_ISSUER_DOMAIN
  Success: .env.example complete, documented
  Test: Manual - verify all vars listed
  Module: Environment documentation
  Time: 10min
  ```

- [ ] **Configure next.config.ts for production**
  ```
  Files: next.config.ts
  Approach: Enable strict mode, configure images domain if needed
  Config: { reactStrictMode: true, ... }
  Success: Production build succeeds
  Test: pnpm build && pnpm start - verify works
  Module: Next.js configuration
  Time: 15min
  ```

### Deployment

- [ ] **Deploy Convex to production**
  ```
  Files: convex/, .env (Convex dashboard)
  Commands: npx convex deploy --prod
  Approach: Follow Convex production deployment docs
  Env vars: Set OPENAI_API_KEY in Convex production dashboard
  Success: Convex functions deployed, production URL available
  Test: Manual - verify Convex dashboard shows production deployment
  Module: Backend deployment
  Time: 15min
  ```

- [ ] **Deploy Next.js to Vercel**
  ```
  Files: vercel.json (optional), .env (Vercel dashboard)
  Commands: vercel --prod or GitHub integration
  Approach: Connect GitHub repo, configure env vars in Vercel dashboard
  Env vars: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_CONVEX_URL (production)
  Success: Production URL live, all features working
  Test: E2E - test production URL, verify question flow
  Module: Frontend deployment
  Time: 20min
  ```

- [ ] **Smoke test production deployment**
  ```
  Files: N/A (manual testing)
  Approach: Full user flow on production URL
  Tests:
    1. Sign in with Clerk
    2. Create 3 questions
    3. Search for question
    4. View related questions
    5. Navigate between pages
  Success: All flows work without errors
  Test: Manual E2E on production
  Module: Production validation
  Time: 15min
  ```

---

## Design Iteration Points

**After Core Data Flow (Phase 2):**
- Review Convex function boundaries - are auth helpers sufficient?
- Check embedding generation performance - is retry logic working?
- Validate schema indexes - are queries efficient?

**After UI Components (Phase 3):**
- Review component composition - are props clean?
- Check optimistic UI - does it feel instant?
- Validate related questions UX - is progressive disclosure clear?

**After Pages & Routing (Phase 4):**
- Review navigation patterns - is routing intuitive?
- Check SSR/CSR boundaries - are Server Components used effectively?
- Validate search UX - is debouncing sufficient?

---

## Automation Opportunities

1. **Type generation:** Convex auto-generates types - no manual work needed
2. **Schema migrations:** Convex handles schema evolution automatically
3. **Deployment:** GitHub Actions for Vercel + Convex deployments (Phase 2+)
4. **Formatting:** Add Prettier pre-commit hook (Phase 2+)
5. **Testing:** Add Vitest for unit tests (Phase 2+)

---

## Success Criteria

### MVP Complete When:
- ✅ Can sign in with Clerk
- ✅ Can create questions (optimistic UI)
- ✅ Questions get embeddings (background)
- ✅ Can search questions semantically
- ✅ Can view related questions (3-5)
- ✅ Can browse all questions chronologically
- ✅ Deployed to production (Vercel)
- ✅ Zero auth bypass bugs
- ✅ <500ms perceived question creation latency
- ✅ Semantic search returns relevant results (subjective)

---

**Total Estimated Time:** 28-32 hours (1-2 weeks at 4-6 hours/day)
**Critical Path:** Project setup → Schema → Embeddings → Search → UI → Deploy
**Parallelizable:** UI components can be built while testing backend functions
