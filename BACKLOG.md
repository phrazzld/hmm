# BACKLOG: hmm Future Enhancements

> Features and improvements deferred from MVP. Prioritize based on user feedback and usage patterns.

---

## Phase 2: Reflection Engine (Post-MVP)

**Goal:** Encourage deeper inquiry through AI-generated prompts

### Features

- [ ] **Post-submit reflection prompts**
  - Generate 1-2 gentle follow-up questions after submitting
  - Socratic style: "What assumptions underlie that question?"
  - Non-intrusive: dismissable, optional engagement
  - Action: GPT-4 mini prompt generation (<100 tokens)

- [ ] **"Go deeper" button**
  - User-triggered action to generate 3 related questions
  - Expands inquiry space without imposing
  - Store generated questions as suggestions (separate table)

- [ ] **Question threads**
  - Add `parentQuestionId` field to schema
  - UI shows thread hierarchy (indent or tree view)
  - Navigate between related questions
  - Visualize inquiry evolution

- [ ] **Weekly digest email**
  - Cron job: every Sunday at 10am
  - Summary: "3 themes emerging", "questions to revisit"
  - Email service: Resend or Postmark
  - Opt-in/opt-out user preference

### Technical Tasks

- Add `reflections` table (questionId, prompt, dismissed, createdAt)
- Implement GPT-4 mini action for prompt generation
- Add `parentQuestionId` to questions schema (nullable)
- Implement email service integration
- Create weekly cron job in Convex
- Add user preferences table (email opt-in, digest frequency)

**Estimated Time:** 1 week
**Priority:** High (drives engagement)

---

## Phase 3: Multi-Voice Answers (Later)

**Goal:** Provide perspectives without definitive answers

### Features

- [ ] **Answer generation UI**
  - "Generate answers" button on question detail page
  - Select voice: Socratic, Poetic, Scientific
  - Store answers in separate table

- [ ] **Answer display**
  - Show all generated answers for a question
  - Tab interface for different voices
  - Pin/favorite answers
  - Edit answers (user customization)

- [ ] **Answer embeddings**
  - Generate embeddings for answers (same as questions)
  - Semantic search across both questions and answers
  - "This answer relates to..." connections

- [ ] **Answer history**
  - Track all generated answers per question
  - Compare different voices
  - Regenerate with improved prompts

### Technical Tasks

- Add `answers` table (questionId, userId, text, voice, createdAt)
- Implement multi-voice prompt templates
- Add answer embeddings to schema
- Extend vector search to include answers
- Create answer management UI
- Add answer editing/pinning

**Estimated Time:** 2 weeks
**Priority:** Medium (Phase 1 validation needed first)

---

## UX Enhancements

### Onboarding

- [ ] **First-time user experience**
  - Show 3-5 sample questions on empty state
  - "Try asking..." prompts
  - Guided tour of related questions feature
  - Animation: type-writer effect for samples

- [ ] **Empty state improvements**
  - Inspirational quote about curiosity
  - Random question prompt ("What's on your mind?")
  - Link to example questions from demo account

### Question Management

- [ ] **Star/favorite questions**
  - Add `starred` boolean to questions
  - Filter view: "Starred questions"
  - Keyboard shortcut: 's' to star

- [ ] **Archive questions**
  - Add `archived` boolean to questions
  - Hide from default view
  - "Show archived" toggle

- [ ] **Edit questions**
  - Allow text editing after creation
  - Track edit history (optional)
  - Re-generate embedding on edit

- [ ] **Delete questions**
  - Soft delete (add `deletedAt` field)
  - Confirmation modal
  - Cascade delete embeddings

### Search & Discovery

- [ ] **Search filters**
  - Filter by date range
  - Filter by starred/archived
  - Filter by "has related questions"

- [ ] **Saved searches**
  - Save semantic search queries
  - Quick access sidebar
  - "Recent searches" history

- [ ] **Question suggestions**
  - "You might want to ask..." based on embeddings
  - Weekly prompt: "Explore this theme"
  - Suggest unasked perspectives

### Visualization

- [ ] **Question constellation view**
  - 2D/3D visualization of related questions
  - UMAP or t-SNE for dimensionality reduction
  - Interactive: click to view question
  - Color by recency or theme

- [ ] **Timeline view**
  - Chronological visualization
  - Group by week/month
  - Show inquiry evolution over time

- [ ] **Theme detection**
  - Auto-detect recurring themes (without explicit clusters)
  - "You've asked N questions about [theme]"
  - Clickable theme tags

---

## Technical Improvements

### Performance

- [ ] **Embedding cache**
  - Cache embeddings in-memory (LRU)
  - Reduce OpenAI API calls for repeated queries
  - Redis or Convex cache table

- [ ] **Batch embedding generation**
  - Queue multiple questions
  - Batch OpenAI API calls (up to 100)
  - Cost savings + rate limit compliance

- [ ] **Vector search optimization**
  - HNSW index tuning (if Convex exposes)
  - Pre-filter by userId before vector search
  - Benchmark query performance (<50ms target)

### Reliability

- [ ] **Retry logic for all external APIs**
  - Standardize retry wrapper
  - Exponential backoff with jitter
  - Circuit breaker pattern

- [ ] **Error monitoring**
  - Integrate Sentry or similar
  - Track embedding generation failures
  - Alert on high error rates

- [ ] **Rate limiting**
  - Prevent abuse (e.g., 100 questions/day limit)
  - Show rate limit status to user
  - Graceful degradation

### Testing

- [ ] **Unit tests (Vitest)**
  - Test auth helpers
  - Test validation logic
  - Test retry logic
  - Target: 80% coverage on utils

- [ ] **Integration tests**
  - Test Convex functions (mutations, queries, actions)
  - Mock OpenAI API
  - Test vector search results

- [ ] **E2E tests (Playwright)**
  - Sign in flow
  - Create question flow
  - Search flow
  - Related questions flow

### Developer Experience

- [ ] **Storybook for components**
  - Document all UI components
  - Visual regression testing
  - Easier component development

- [ ] **GitHub Actions CI/CD**
  - Run tests on PR
  - Type-check on PR
  - Auto-deploy to Vercel preview on PR
  - Auto-deploy to production on merge to main

- [ ] **Pre-commit hooks**
  - Prettier formatting
  - ESLint checks
  - Type-check
  - Use Husky + lint-staged

---

## Infrastructure & Operations

### Monitoring

- [ ] **Analytics**
  - Track question creation rate
  - Track search usage
  - Track related question clicks
  - Plausible or PostHog (privacy-friendly)

- [ ] **Cost monitoring**
  - Track OpenAI API costs
  - Alert if >$10/month
  - Dashboard showing cost per user

- [ ] **Performance monitoring**
  - Vercel Analytics
  - Convex dashboard metrics
  - Track p50/p95/p99 latencies

### Scaling

- [ ] **User limits (soft launch)**
  - Limit to 100 users initially
  - Waitlist for new users
  - Invite-only system

- [ ] **Data export**
  - Export all questions as JSON
  - Export all questions as Markdown
  - GDPR compliance (right to data portability)

- [ ] **Multi-tenancy hardening**
  - Audit all queries for userId filtering
  - Add integration tests for data isolation
  - Security review

---

## Advanced Features (Future Vision)

### Collaborative Spaces

- [ ] **Shared question spaces**
  - Create "rooms" for group inquiry
  - Invite others to collaborate
  - Separate permissions (view, contribute, admin)

- [ ] **Public questions**
  - Optional: make questions public
  - hmm.zone - discover others' questions
  - Upvote/comment on public questions

### AI-Powered Features

- [ ] **Question clustering (HDBSCAN)**
  - Auto-detect themes without user input
  - Generate cluster labels via GPT-4
  - "Questions about identity" auto-collection

- [ ] **Proactive nudges**
  - "You asked this 3 months ago. Want to revisit?"
  - "You haven't asked about X lately"
  - Weekly "curiosity check-in"

- [ ] **Question quality scoring**
  - Analyze question depth/complexity
  - Suggest improvements: "Make it more specific?"
  - Track inquiry growth over time

### Integrations

- [ ] **Voice input (Whisper API)**
  - Record voice questions
  - Transcribe via OpenAI Whisper
  - Store audio + transcript

- [ ] **Browser extension**
  - Highlight text on web -> ask question about it
  - Context: URL, page title, selected text
  - Quick capture without leaving browser

- [ ] **Mobile app**
  - React Native or native iOS/Android
  - Push notifications for weekly digest
  - Offline-first with sync

- [ ] **API for external tools**
  - Export questions to Obsidian/Notion
  - Import questions from journal apps
  - Webhook for new questions

---

## Research & Exploration

### Embedding Improvements

- [ ] **A/B test embedding models**
  - Compare text-embedding-3-small vs -large
  - Measure search relevance improvement
  - Cost vs quality tradeoff analysis

- [ ] **Hybrid search**
  - Combine semantic + keyword search
  - Fallback to keyword if semantic fails
  - Evaluate relevance improvement

- [ ] **Rerank search results**
  - Use Cohere Rerank API
  - Improve top-5 result quality
  - Measure impact on exploration

### UX Research

- [ ] **User testing sessions**
  - 5-10 users test MVP
  - Observe question creation flow
  - Identify friction points

- [ ] **Usage analytics review**
  - Which features are used most?
  - Where do users drop off?
  - What drives retention?

- [ ] **Survey early adopters**
  - NPS score
  - Feature requests
  - Pain points

---

## Prioritization Framework

**High Priority (Do Next):**

- Features that directly improve core value (semantic search quality, related questions UX)
- Reliability improvements (error handling, retry logic)
- Basic analytics (understand usage patterns)

**Medium Priority (After Validation):**

- Features that encourage deeper engagement (reflection prompts, threads)
- UX polish (empty states, onboarding, keyboard shortcuts)
- Developer experience (testing, CI/CD)

**Low Priority (Future Vision):**

- Features that require scale validation first (collaboration, public questions)
- Advanced AI features (clustering, quality scoring)
- Platform expansion (mobile app, browser extension)

**Evaluate After 3 Months:**

- Do users return weekly?
- Are related questions explored?
- Is semantic search providing value?
- What features are requested most?

---

**Last Updated:** 2025-10-13
**Review Cadence:** Monthly after MVP launch
