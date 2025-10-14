# hmm - Semantic Question Journal

> **"A place for curiosity — powered by meaning, not metadata."**

---

## Executive Summary

**hmm** is a minimal semantic question journal that replaces manual organization with vector embeddings and AI-driven discovery. Users ask questions through a single text input; the system automatically understands relationships and surfaces relevant past questions without requiring tags, folders, or categories. Success is measured by question velocity (daily asks) and exploration depth (following semantic connections). The MVP focuses on frictionless capture and intelligent recall — answers and multi-voice responses come later.

**Timeline:** 1-2 weeks for working MVP
**Stack:** Next.js 15 + Convex + Clerk + OpenAI (text-embedding-3-small) + shadcn/ui
**Deployment:** Vercel

---

## User Context

### Who Uses This

**Primary user:** You (developer/thinker) — personal knowledge journaling
**Secondary users:** Small group of early adopters (no marketing yet)
**Scale:** <10k questions per user initially

### Problems Being Solved

1. **Organization overhead:** Traditional note-taking demands upfront categorization
2. **Lost connections:** Related thoughts scatter across time without visible links
3. **Exploration friction:** Finding past questions requires remembering exact keywords
4. **Question atrophy:** Good questions get buried and forgotten without periodic resurfacing

### Measurable Benefits

- **Capture speed:** Ask question → stored in <500ms (optimistic UI)
- **Discovery:** Find semantically related questions without keyword matching
- **Exploration:** 3-5 related suggestions per question encourage deeper inquiry
- **Cost efficiency:** <$1/year for 10k questions (embedding costs)

---

## Requirements

### Functional Requirements

**FR1: Question Capture**
- Single text input field (no multi-field forms)
- Submit on Enter or button click
- Optimistic UI (instant feedback, background processing)
- Timestamp and user association automatic

**FR2: Semantic Search**
- Natural language queries ("questions about identity" finds related content)
- Results ranked by cosine similarity
- Return top 10-20 matches
- <100ms query latency

**FR3: Related Questions**
- Show 3-5 contextually similar questions for each question
- Progressive disclosure (collapsible "Related" section)
- Exclude current question from results
- Display snippet + creation date

**FR4: Question Review**
- Chronological list of all questions (newest first)
- Pagination or infinite scroll (50 questions/page)
- Click to view details + related questions
- Filter by date range (optional Phase 2)

**FR5: Authentication**
- Clerk-based auth with JWT validation
- Support authenticated and anonymous users
- Questions scoped to user (no cross-user leakage)
- Future migration path from anonymous → authenticated

### Non-Functional Requirements

**NFR1: Performance**
- Page load: <2s (initial + hydration)
- Embedding generation: <3s (background, non-blocking)
- Vector search: <100ms per query
- Optimistic updates: <50ms perceived latency

**NFR2: Security**
- User data isolation (Convex queries filtered by userId)
- JWT validation on all authenticated endpoints
- No PII in embeddings (text only)
- HTTPS-only in production

**NFR3: Reliability**
- Graceful degradation (embeddings fail → store question anyway)
- Retry logic for OpenAI API (3 retries with exponential backoff)
- Error boundaries in UI (crashes don't lose data)

**NFR4: Maintainability**
- TypeScript strict mode
- Server Components by default (Client Components explicit)
- Clear module boundaries (UI/API/Data/AI layers)
- Convex schema versioning

**NFR5: Cost**
- OpenAI embeddings: <$0.05/month (10 questions/day)
- Convex: Free tier (1GB storage, 1M vector searches/month)
- Clerk: Free tier (10k MAU)
- Vercel: Hobby tier

---

## Architecture Decision

### Selected Approach: **Convex-Native Vector Search**

**Description:**
Use Convex's built-in vector index for embeddings + search. Questions and embeddings stored in separate Convex tables. OpenAI API called via Convex actions. No external vector database.

**Rationale:**
- **Simplicity:** Single backend (Convex) eliminates sync complexity
- **User value:** Real-time subscriptions via `useQuery` (instant UI updates)
- **Explicitness:** Schema-defined vector dimensions, no hidden config
- **Cost:** Free tier covers MVP scale (<10k questions/user)

### Alternatives Considered

| Approach | User Value | Simplicity | Explicitness | Risk | Why Not Chosen |
|----------|-----------|-----------|--------------|------|----------------|
| **Convex Native** ✅ | High (real-time) | High (1 backend) | High (schema) | Low | **Selected** |
| Supabase + pgvector | Medium (polling) | Medium (2 systems) | Medium (SQL) | Medium | Extra infra, no real-time |
| LanceDB + Convex | High | Low (2 DBs sync) | Low (embedded) | High | Sync complexity, overkill for scale |
| Local-first (IndexedDB) | Low (no sync) | Medium | Low (browser) | High | No cross-device, data loss risk |

**Key Tradeoff:**
Convex locks us into their ecosystem, but simplicity and real-time subscriptions justify the coupling. Embeddings are portable (can export if needed).

---

## Module Boundaries

### **UI Layer** (Client Components)
**Interface:** React components accepting `questions`, `searchQuery`, `onSubmit` props
**Responsibility:** User interaction, optimistic updates, loading states
**Hidden complexity:** Debouncing, error handling, accessibility
**Exports:** `<QuestionInput>`, `<QuestionList>`, `<RelatedQuestions>`, `<SearchBar>`

### **API Layer** (Convex Functions)
**Interface:** `createQuestion(text)`, `searchQuestions(query)`, `getRelated(questionId)`
**Responsibility:** Data validation, user auth, DB queries
**Hidden complexity:** JWT validation, pagination, filtering
**Exports:** Typed API via `convex/_generated/api`

### **Data Layer** (Convex Schema)
**Interface:** `questions` and `embeddings` tables with indexes
**Responsibility:** Persistence, vector indexing, real-time subscriptions
**Hidden complexity:** Vector storage format, index optimization
**Exports:** Type-safe schema via `convex/_generated/dataModel`

### **AI Layer** (Convex Actions)
**Interface:** `generateEmbedding(questionId)`, `semanticSearch(query, userId)`
**Responsibility:** OpenAI API calls, embedding generation, error retry
**Hidden complexity:** API rate limiting, token counting, batching
**Exports:** Internal actions (not exposed to client)

### Abstraction Layers

```
UI Components (React props)
  ↓ "Submit question"
Convex Mutations (text, userId)
  ↓ "Store + schedule embedding"
Convex Actions (OpenAI API)
  ↓ "Generate vector"
Vector Index (cosine similarity)
  ↓ "Return IDs + scores"
Convex Queries (hydrate questions)
  ↓ "Render results"
```

**Each layer changes vocabulary:**
- UI: "question", "related", "search"
- API: "mutation", "query", "action"
- Data: "insert", "vectorSearch", "filter"
- AI: "embedding", "cosine", "dimensions"

---

## Dependencies & Assumptions

### External Dependencies
- **Convex:** Stable API, vector search available in free tier
- **OpenAI:** text-embedding-3-small model availability (<$0.02/1M tokens)
- **Clerk:** Free tier supports 10k MAU, JWT template creation
- **Vercel:** Hobby tier supports Next.js 15 App Router
- **shadcn/ui:** Components compatible with Next.js 15

### Assumptions
- **Scale:** <10k questions/user, <100 users in first 6 months
- **Growth:** No viral marketing, organic growth only
- **Usage:** 5-10 questions/day per active user
- **Search frequency:** 2-3 searches per session
- **Embedding model:** OpenAI maintains text-embedding-3-small (or provides migration)
- **Infrastructure:** Convex remains viable (no acquisition/shutdown)

### Environment Requirements
- **Node.js:** 22.x (latest LTS)
- **npm/pnpm:** Latest
- **Environment variables:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CONVEX_URL`, `OPENAI_API_KEY`, `CLERK_JWT_ISSUER_DOMAIN`
- **Deployment:** Vercel project with automatic GitHub deployments

---

## Implementation Phases

### Phase 1: MVP — Ask, Store, Recall (1-2 weeks)

**Goal:** Prove core value — semantic search works, questions are discoverable

**Features:**
1. Question capture with optimistic UI
2. Background embedding generation (Convex action)
3. Semantic search via vector similarity
4. Related questions (3-5 per question)
5. Question list (chronological, paginated)
6. Clerk authentication (authenticated users only for MVP)

**Technical tasks:**
- Next.js 15 project setup with TypeScript
- Convex schema (`questions`, `embeddings` tables)
- Clerk integration (middleware, provider)
- OpenAI API action (embedding generation)
- shadcn/ui components (`Input`, `Button`, `Card`, `ScrollArea`)
- Server/Client Component architecture
- Vector search query with user filtering
- Optimistic updates via `useOptimistic`

**Success criteria:**
- Ask question → stored in <500ms (perceived)
- Search "identity" → finds related questions without keyword match
- Related questions show relevant suggestions (subjective eval)
- Zero data leaks between users

### Phase 2: Reflection Engine (1 week)

**Goal:** Encourage deeper inquiry through AI-generated prompts

**Features:**
1. Post-submit reflection (1-2 gentle follow-up prompts)
2. "Go deeper" action (generate 3 related questions)
3. Question threads (link follow-ups to original)
4. Weekly digest (email: "themes emerging", "questions to revisit")

**Technical tasks:**
- Convex action for GPT-4 prompts (Socratic style)
- Thread relationship schema (`parentQuestionId` field)
- Email service integration (Resend or Postmark)
- Scheduled Convex cron (weekly digest)

**Success criteria:**
- 30% of questions trigger follow-up (user engagement)
- Reflection prompts feel gentle (not pushy)
- Weekly digest open rate >50%

### Phase 3: Multi-Voice Answers (2 weeks)

**Goal:** Provide perspectives without definitive answers

**Features:**
1. Answer generation (Socratic, poetic, scientific voices)
2. Answer history (track generated answers per question)
3. Pin/edit answers (user customization)
4. Answer embeddings (semantic search across answers)

**Technical tasks:**
- `answers` table schema
- Multi-voice prompt templates
- Answer rendering UI
- Answer search integration

**Success criteria:**
- Users generate answers for 40% of questions
- Multiple voices feel distinct (user survey)
- Answer search useful (measured by usage)

---

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **OpenAI API cost spike** | Medium | High | Rate limiting (10 embeds/min), caching, fallback to cheaper model |
| **Convex free tier exceeded** | Low | Medium | Monitor usage dashboard, upgrade to paid ($25/mo) if needed |
| **Embedding quality poor** | Low | High | A/B test text-embedding-3-small vs -large, tune similarity threshold |
| **UI feels too sparse** | Medium | Low | User testing, add "empty state" guidance, sample questions |
| **Search returns irrelevant results** | Medium | Medium | Tune similarity threshold (0.7 → 0.75), add hybrid keyword fallback |
| **Users don't return** | High | High | Weekly digest email, proactive prompts, show "unanswered" questions |
| **Clerk auth complexity** | Low | Medium | Follow official Convex+Clerk docs, test anonymous migration early |
| **Real-time subscriptions lag** | Low | Low | Convex handles this, fallback to polling if issues arise |

**Strategic mitigation:**
Start with authenticated-only users (skip anonymous complexity for MVP). Add anonymous support in Phase 2 if validated.

---

## Key Decisions

### **Decision 1: text-embedding-3-small (1536 dims)**

**What:** Use OpenAI's text-embedding-3-small model for all embeddings
**Alternatives:** text-embedding-3-large (3072 dims), ada-002 (1536 dims)
**Rationale:**
- **User value:** 95%+ quality of -large at 15% cost
- **Simplicity:** Single model, predictable dimensions
- **Explicitness:** 1536 dims fits Convex vector index constraints
- **Tradeoffs:** Slightly lower quality on subtle semantic distinctions (acceptable for MVP)

### **Decision 2: No Clustering in MVP**

**What:** Skip k-means/HDBSCAN clustering, use only vector similarity
**Alternatives:** Auto-clustering with AI labels, manual tags, hybrid
**Rationale:**
- **User value:** Semantic search achieves 80% of clustering benefits
- **Simplicity:** One fewer system to build/maintain
- **Explicitness:** Direct similarity scores > inferred clusters
- **Tradeoffs:** Less "discovery" of themes (add in Phase 2 if needed)

### **Decision 3: Clerk for Auth**

**What:** Use Clerk instead of NextAuth, custom, or Convex auth
**Alternatives:** NextAuth (Auth.js), Convex built-in auth, custom JWT
**Rationale:**
- **User value:** Best DX, supports anonymous → authenticated migration
- **Simplicity:** Official Convex integration, minimal config
- **Explicitness:** JWT template clearly defines claims
- **Tradeoffs:** Vendor lock-in (mitigated by standard JWT tokens)

### **Decision 4: Server Components by Default**

**What:** Use React Server Components for all pages, opt-in to Client Components
**Alternatives:** Full client-side (CSR), hybrid with more client components
**Rationale:**
- **User value:** Faster page loads, better SEO (if public later)
- **Simplicity:** Fetch data on server, pass props to client
- **Explicitness:** `"use client"` directive makes boundaries clear
- **Tradeoffs:** Learning curve (new paradigm), but Next.js 15 standard

### **Decision 5: Optimistic UI (useOptimistic)**

**What:** Show question instantly on submit, reconcile with server
**Alternatives:** Blocking UI (wait for server), skeleton loader
**Rationale:**
- **User value:** Perceived latency <50ms vs 500ms+
- **Simplicity:** React 19 `useOptimistic` hook is stable
- **Explicitness:** Optimistic state clearly separated from server state
- **Tradeoffs:** Slightly more complex state management (worth it for UX)

### **Decision 6: Related Questions in Collapsible Section**

**What:** Show "Related (3)" badge, expand on click
**Alternatives:** Always-visible sidebar, modal, separate page
**Rationale:**
- **User value:** Progressive disclosure, not overwhelming
- **Simplicity:** Single component, no routing
- **Explicitness:** User chooses to explore connections
- **Tradeoffs:** Might be overlooked (mitigate with subtle animation)

---

## Success Metrics

### MVP Success (Phase 1)
- ✅ Deploy to production (Vercel)
- ✅ Ask 100 questions yourself (dogfooding)
- ✅ Semantic search finds relevant results (>80% subjective accuracy)
- ✅ Related questions feel useful (>3 explorations/session)
- ✅ Cost <$5/month
- ✅ Zero bugs in question capture flow

### Product-Market Fit (Phase 3+)
- 10 active users (5+ questions/week)
- 30% weekly retention
- Average 3 related question explorations per session
- NPS >50 (qualitative survey)

---

## Next Steps

1. **Run `/plan`** to break down Phase 1 into implementation tasks
2. **Setup project:** Initialize Next.js, Convex, Clerk
3. **Schema first:** Define Convex tables + vector index
4. **Core flow:** Question capture → embedding → search
5. **UI polish:** shadcn/ui components, responsive design
6. **Deploy:** Vercel preview + production

---

## Appendix: Technical Constraints

**TypeScript:** Strict mode, noUncheckedIndexedAccess
**Linting:** ESLint + Prettier (via Next.js defaults)
**Testing:** Manual testing for MVP (add Vitest in Phase 2)
**Monitoring:** Convex dashboard, Vercel Analytics
**Version control:** Git + GitHub, feature branches
**CI/CD:** Vercel automatic deployments (main branch → production)

---

**Last Updated:** 2025-10-13
**Spec Author:** Claude (via /spec command)
**Stakeholder:** phaedrus (primary user + developer)
