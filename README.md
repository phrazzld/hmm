# hmm

semantic question journal. ask, search, discover connections. no folders, just meaning.

## what is this?

ever notice how the best insights come from connecting questions you asked months apart? **hmm** remembers every question you ask and discovers relationships through meaning, not metadata.

no tags. no folders. no organization required. just ask questions and let ai find the patterns.

## how it works

1. **ask** — type any question that crosses your mind
2. **discover** — see semantically related questions appear automatically
3. **search** — find questions by meaning, not just keywords
4. **connect** — watch your curiosity form unexpected patterns

questions are embedded using openai's text-embedding-3-small model. similar questions cluster together without you lifting a finger.

## features

- **semantic search** — "how do i stay motivated?" finds "what makes work feel meaningful?"
- **auto-related questions** — every question shows similar ones with similarity scores
- **zero organization** — no tags, categories, or manual linking required
- **privacy-first** — your questions are yours, vector search filtered by user
- **real-time** — questions and relationships update instantly
- **dark mode** — because of course

## tech stack

- **next.js 15** — app router, react 19, typescript
- **convex** — real-time database with vector search
- **clerk** — authentication
- **openai** — text-embedding-3-small for 1536-dim embeddings
- **tailwind** + **shadcn/ui** — styling and components
- **pnpm** — package management

## quick start

```bash
# clone it
git clone https://github.com/phrazzld/hmm.git
cd hmm

# install (pnpm required)
pnpm install

# set up environment variables
cp .env.example .env.local
# fill in: NEXT_PUBLIC_CONVEX_URL, CLERK_*, OPENAI_API_KEY

# run development servers (next.js + convex)
pnpm dev

# open http://localhost:3000
```

## environment setup

**required services:**
1. [convex](https://convex.dev) — backend + database + vector search
2. [clerk](https://clerk.com) — authentication
3. [openai](https://platform.openai.com) — embeddings api

**environment variables:**

```bash
# .env.local (next.js)
NEXT_PUBLIC_CONVEX_URL=        # from `npx convex dev`
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=       # from clerk dashboard

# convex dashboard (set via `npx convex env set`)
OPENAI_API_KEY=
CLERK_JWT_ISSUER_DOMAIN=
```

## development

```bash
# run everything (recommended)
pnpm dev

# run next.js only
pnpm dev:next-only

# run convex only
pnpm dev:convex-only

# type checking
pnpm type-check

# linting
pnpm lint

# production build
pnpm build
```

## architecture highlights

**data model:**
- `users` — clerk integration
- `questions` — your questions with timestamps
- `embeddings` — 1536-dim vectors with vector index

**key flows:**
1. question created → embedding generated async → stored with vector index
2. semantic search → query embedded → vector search → results ranked by similarity
3. related questions → fetch question embedding → find similar → filter self

**why this works:**
- embeddings capture semantic meaning beyond keywords
- vector search finds similarity in 1536-dimensional space
- convex handles real-time updates and vector indexing
- everything scoped to authenticated user

## design philosophy

**simplicity over features** — one text input. no organization ui. relationships emerge automatically.

**privacy first** — your questions never leave your account. vector search filtered by userid.

**optimistic ui** — questions appear instantly. embeddings generate in background.

**meaning over metadata** — no forced categorization. discover patterns you didn't plan.

## what's next

- **clustering** — auto-generated themes from question patterns
- **follow-ups** — ai suggests deeper questions to explore
- **analytics** — curiosity patterns over time
- **multi-voice answers** — socratic, poetic, scientific perspectives

## contributing

built with curiosity. contributions welcome.

## license

mit
