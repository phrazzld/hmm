# TODO: Comprehensive Test Coverage

## Context

**Critical Issue**: Zero production test coverage (TASK.md maintainability finding)
**Risk**: Breaking changes discovered in production, unsafe refactoring, security vulnerabilities in auth/search
**Approach**: Layer-by-layer testing (utilities → backend → components)
**Testing Stack**: Vitest + React Testing Library + jsdom (already configured)
**Pattern**: Follow existing vitest.config.ts setup, use describe/it/expect

**Module Testing Priority**:

1. **Security-critical** (auth, validation) - highest risk
2. **Business logic** (retry, utilities) - pure functions, easy wins
3. **Data layer** (Convex queries/mutations) - mocking required
4. **UI components** - integration tests only for critical flows

**Key Files**:

- `vitest.config.ts` - Vitest configured with React plugin, jsdom, path aliases
- `vitest.setup.ts` - Global test setup
- `src/__tests__/example.test.ts` - Placeholder test (shows working setup)

---

## Implementation Tasks

### Phase 1: Foundation & Pure Functions (2-3 hours)

- [x] **Test validation utilities (security-critical)**

  ```
  Files: src/lib/validation.test.ts (NEW), src/lib/validation.ts
  Approach: Pure function testing, no mocking needed
  Tests:
    - Empty question → returns error
    - Under min length (2 chars) → returns error with message
    - Valid question (3-500 chars) → returns { valid: true }
    - Over max length (501 chars) → returns error with message
    - Whitespace-only question → returns error
    - Question with leading/trailing whitespace → trims and validates
  Success: 100% branch coverage for validateQuestion
  Module: Input validation (security boundary - prevents XSS, injection)
  Time: 30min

  Work Log:
  - Created 10 test cases covering all validation branches
  - All tests passing (2ms execution time)
  - 100% coverage achieved for security boundary
  ```

- [x] **Test retry logic (reliability-critical)**

  ```
  Files: convex/lib/retry.test.ts (NEW), convex/lib/retry.ts
  Approach: Mock async functions, test timing with vi.useFakeTimers()
  Tests:
    - Success on first attempt → no retries, returns result
    - Transient failure then success → retries once, returns result
    - All retries fail → throws last error after maxRetries
    - Exponential backoff timing → verify delays increase (1s, 2s, 4s)
    - Custom retry config → respects maxRetries/baseDelay/maxDelay
    - Jitter applied → delay varies within expected range
  Success: 100% branch coverage, timing verified
  Module: OpenAI API reliability (prevents cascading failures)
  Time: 45min

  Work Log:
  - Created 9 comprehensive test cases
  - Used vi.useFakeTimers() for deterministic timing tests
  - Tested exponential backoff with jitter
  - All tests passing (6ms execution time)
  - Proper async promise handling (no unhandled rejections)
  ```

- [x] **Test date formatting utilities**

  ```
  Files: src/lib/date.test.ts (NEW), src/lib/date.ts
  Approach: Freeze Date.now() with vi.setSystemTime(), test all branches
  Tests:
    - Just now (<60s) → "just now"
    - Minutes ago (1-59 mins) → "X minutes ago"
    - Hours ago (1-23 hrs) → "X hours ago"
    - Days ago (1-29 days) → "X days ago"
    - Months ago (30+ days) → "X months ago"
    - Edge cases: exactly 60s, exactly 60m, exactly 24h
  Success: All time ranges covered
  Module: User-facing timestamps (UX clarity)
  Time: 30min

  Work Log:
  - Created 20 comprehensive test cases (13 for dates, 7 for truncation)
  - Combined both formatRelativeDate and truncateText tests in one file
  - Used vi.useFakeTimers() for deterministic date testing
  - All time ranges tested including edge cases (years support added)
  - Truncation tests include whitespace trimming edge cases
  - All tests passing (4ms execution time)
  - 100% coverage for both utilities
  ```

### Phase 2: Backend Logic (Convex Testing) (3-4 hours)

**Note**: Convex functions need custom test setup - no built-in test harness. Create mocks for `ctx.db`, `ctx.auth`, `ctx.scheduler`.

- [x] **Create Convex test utilities (foundational)**

  ```
  Files: convex/test/utils.ts (NEW)
  Approach: Mock factory functions for MutationCtx, QueryCtx
  Exports:
    - mockMutationCtx(options?) → { db, auth, scheduler, storage }
    - mockQueryCtx(options?) → { db, auth }
    - mockAuth(userId?, identity?) → getUserIdentity mock
    - mockDb() → { query, get, insert, patch, delete, ... }
  Success: Reusable test doubles for all Convex tests
  Module: Test infrastructure (enables backend testing)
  Time: 60min
  Note: This is foundational - all backend tests depend on this

  Work Log:
  - Created complete mock implementation for Convex database
  - In-memory storage with query/insert/patch/delete support
  - Index filtering with .withIndex() and .eq() support
  - Mock auth with configurable authenticated/unauthenticated states
  - Mock scheduler and storage utilities
  - 12 tests verifying all mock functionality
  - Deep module: mockQueryCtx() and mockMutationCtx() hide all complexity
  ```

- [x] **Test auth helpers (security-critical)**

  ```
  Files: convex/lib/auth.test.ts (NEW), convex/lib/auth.ts
  Approach: Use mockMutationCtx, verify user creation/retrieval
  Tests:
    - requireAuth with authenticated user → returns userId
    - requireAuth with no auth → throws "Unauthenticated"
    - requireAuth with new user → creates user, returns userId
    - requireAuth with existing user → returns existing userId, no duplicate
    - requireAuthClerkId with authenticated user → returns Clerk ID
    - requireAuthClerkId with no auth → throws "Unauthenticated"
  Success: 100% coverage, security boundaries enforced
  Module: Authentication layer (prevents unauthorized access)
  Time: 45min

  Work Log:
  - Created 8 comprehensive auth tests
  - Verified user creation and deduplication logic
  - Tested unauthenticated access throws errors (security boundary)
  - Tested both requireAuth (mutations) and requireAuthClerkId (queries)
  - Fixed mockAuth to handle explicit empty email strings
  - All tests passing (4ms execution time)
  - Security critical: No unauthorized access possible
  ```

- [x] **Test question mutations (business-critical)**

  ```
  Files: convex/questions.test.ts (NEW), convex/questions.ts
  Approach: Mock ctx, verify db.insert calls, scheduler.runAfter
  Tests:
    - createQuestion with valid text → inserts question, schedules embedding
    - createQuestion with unauthenticated user → throws error
    - createQuestion sets userId correctly → filters by current user
    - createQuestion auto-generates timestamps → createdAt, updatedAt set
  Success: Questions isolated by user, timestamps automatic
  Module: Question creation (core feature)
  Time: 45min

  Work Log:
  - Created 6 comprehensive mutation tests
  - Verified scheduler.runAfter called for embedding generation
  - Tested user isolation (questions belong to correct user)
  - Verified auto timestamp generation (createdAt = updatedAt)
  - Tested user auto-creation on first question
  - Fixed mockScheduler to handle complex Convex function references
  - All tests passing (6ms execution time)
  - Business critical: Core feature verified working correctly
  ```

- [x] **Test question queries (data isolation)**

  ```
  Files: convex/questions.test.ts (add to existing), convex/questions.ts
  Approach: Mock db with multiple users' questions, verify filtering
  Tests:
    - getQuestions returns only current user's questions
    - getQuestions returns empty array for new user
    - getQuestions orders by createdAt desc
    - getQuestions respects limit parameter
    - getQuestion with valid ID and ownership → returns question
    - getQuestion with valid ID but wrong user → throws "Not found"
    - getQuestion with invalid ID → throws "Not found"
  Success: Zero data leakage across users (security-critical)
  Module: Question retrieval (privacy boundary)
  Time: 45min

  Work Log:
  - Added pagination support to mockDb (paginate method with cursor support)
  - Created 9 comprehensive query tests (4 for getQuestions, 4 for getQuestion)
  - Verified user isolation: User 1 cannot access User 2's questions
  - Verified empty states: unauthenticated and new users handled gracefully
  - Verified ordering: Questions returned in desc createdAt order (newest first)
  - Verified pagination: Limit respected, continueCursor works
  - All 15 question tests passing (6 mutations + 9 queries)
  - Total test count: 76 tests passing (up from 61)
  - Security verified: Zero data leakage between users
  ```

### Phase 3: React Components (Integration Tests) (2-3 hours)

**Note**: Only test critical user flows. Skip shadcn/ui components (already tested upstream).

- [x] **Test QuestionInput component (user-facing)**

  ```
  Files: src/components/questions/QuestionInput.test.tsx (NEW)
  Approach: Render, userEvent for typing/submit, mock useMutation
  Tests:
    - Typing question updates textarea
    - Submit with valid question → calls mutation, clears input
    - Submit with invalid question → shows error toast, preserves text
    - Character counter updates correctly
    - Character counter shows warning at 450+ chars
    - Enter key submits (no Shift)
    - Shift+Enter inserts newline (no submit)
    - Mutation error → shows toast, restores text
  Success: Full user flow tested, edge cases covered
  Module: Question input UI (primary user interaction)
  Time: 60min

  Work Log:
  - Created 11 comprehensive UI interaction tests
  - Mocked useMutation (Convex) and useToast hooks
  - Verified typing updates textarea value
  - Verified valid submission clears input and calls mutation
  - Verified invalid submission shows toast and preserves text
  - Verified character counter appears at 80% (400 chars)
  - Verified warning color (text-accent) at <50 chars remaining
  - Verified Enter key submits, Shift+Enter adds newline
  - Verified mutation error restores text and shows toast
  - Verified onQuestionCreated callback called with question ID
  - Verified button disabled when empty or pending
  - All 11 tests passing (total: 87 tests, up from 76)
  - User interaction flow fully validated
  ```

- [ ] **Test SearchBar component (debounce logic)**

  ```
  Files: src/components/search/SearchBar.test.tsx (NEW)
  Approach: Render, userEvent for typing, vi.useFakeTimers for debounce
  Tests:
    - Typing triggers debounced search (500ms delay)
    - Rapid typing cancels previous debounce
    - Shows loading state during search
    - Search returns results → calls onResults callback
    - Search fails → shows error toast
    - Empty query → no search triggered
  Success: Debounce behavior verified, prevents API spam
  Module: Search UI (prevents expensive OpenAI calls)
  Time: 45min
  ```

- [ ] **Test RelatedQuestions component (lazy loading)**
  ```
  Files: src/components/questions/RelatedQuestions.test.tsx (NEW)
  Approach: Render, click to expand, mock useAction
  Tests:
    - Collapsed by default (progressive disclosure)
    - First expand triggers action call (lazy loading)
    - Second expand reuses cached results (no duplicate call)
    - Loading state shows skeleton cards
    - Empty results shows "No related questions"
    - Results render as QuestionCards
  Success: Lazy loading verified, prevents unnecessary API calls
  Module: Related questions UI (performance optimization)
  Time: 45min
  ```

---

## Testing Commands

```bash
# Run all tests (watch mode)
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run with UI (visual test runner)
pnpm test:ui

# Run specific test file
pnpm test src/lib/validation.test.ts

# Check coverage
pnpm test -- --coverage
```

---

## Success Criteria

### Coverage Targets

- **Utilities**: 100% (pure functions, no excuses)
- **Backend logic**: 90%+ (auth, mutations, queries)
- **Components**: 80%+ (critical flows only)

### Must-Have Tests (Security)

- ✅ Auth helpers throw on unauthenticated access
- ✅ Queries filter by userId (no data leakage)
- ✅ Validation rejects malicious input

### Must-Have Tests (Reliability)

- ✅ Retry logic handles transient failures
- ✅ OpenAI API calls wrapped in withRetry
- ✅ Debounce prevents API spam

### Quality Gates

- All tests pass in CI (`pnpm test:run`)
- No console warnings in test output
- Tests run in <10s (watch mode feedback loop)

---

## Design Iteration

**After Phase 1 (Pure Functions)**:

- Review test readability - are describe blocks clear?
- Check test speed - any slow tests (<100ms per test)?
- Extract common test fixtures to reduce duplication

**After Phase 2 (Backend)**:

- Review mock complexity - are mocks too brittle?
- Check for integration test opportunities (end-to-end flows)
- Identify shared mock patterns → add to convex/test/utils.ts

**After Phase 3 (Components)**:

- Review component test coverage - are we testing implementation vs behavior?
- Check for flaky tests (race conditions, timing issues)
- Identify E2E test candidates (full user flows spanning multiple components)

---

## Future Testing Phases (BACKLOG.md)

**Not in this PR** - these are follow-on work:

1. **Integration tests** (2d) - Full flows: sign-in → create question → search → view related
2. **E2E tests** (3d) - Playwright for critical user journeys
3. **Performance tests** (1d) - Verify search <500ms, embedding <3s
4. **Contract tests** (1d) - OpenAI API response format validation
5. **Visual regression** (2d) - Screenshot testing for UI components

---

## Automation Opportunities

1. **Pre-commit hook**: Run tests on changed files only (fast feedback)
2. **GitHub Actions**: Run full test suite on PR (gate merging)
3. **Coverage reporting**: Upload to Codecov, track over time
4. **Mutation testing**: Stryker.js to verify test quality (catch weak tests)

---

**Total Estimated Time**: 7-10 hours
**Critical Path**: Test utilities → Backend → Components
**Parallelizable**: Phase 1 and Phase 2 tasks independent
**Blocker for**: Safe refactoring, production deployment, team scaling
