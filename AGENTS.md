# Repository Guidelines

## Project Structure & Module Organization

- `src/app` holds Next.js routes, layouts, and server components; keep segments focused and delegate UI to reusable pieces.
- `src/components` contains shared client components (PascalCase filenames). Co-locate lightweight variants or stories when they clarify usage.
- `src/hooks` collects custom React hooks; prefix files with `use-` and export a single default hook.
- `src/lib` stores shared utilities (API clients, schema helpers) and is imported via `@/lib/...`.
- `src/styles` defines global CSS and Tailwind layer overrides. Tailwind tokens live in `tailwind.config.ts`.
- `convex/` hosts Convex functions, schema, and server-side helpers; group domain logic by feature (e.g., `questions.ts`).
- Environment templates live in `.env.example`; copy to `.env.local` and never commit secrets.

## Build, Test, and Development Commands

- `pnpm install` installs dependencies (enforced via `npx only-allow pnpm`).
- `pnpm dev` runs Next.js (Turbopack) and Convex together for a fully functional local stack.
- `pnpm dev:next` / `pnpm dev:convex` start either service in isolation when debugging.
- `pnpm build` compiles the production bundle; follow with `pnpm start` to serve the build locally.
- `pnpm lint` runs ESLint with `next/core-web-vitals`; `pnpm type-check` verifies the TypeScript project.

## Coding Style & Naming Conventions

- Use TypeScript and functional React components throughout.
- Indent with two spaces; order imports framework → third-party → internal aliases.
- Components and Convex actions use PascalCase (`QuestionList.tsx`, `Questions.ts`); utilities/constants use camelCase or SCREAMING_SNAKE_CASE as appropriate.
- Prefix hooks with `use` and store hook-specific helpers alongside them.
- Compose styles with Tailwind classes; add shared design tokens in `tailwind.config.ts` rather than inline magic numbers.

## Testing Guidelines

- Automated tests are not yet standardized; when introducing them, colocate `*.test.ts(x)` files near the source.
- Favor React Testing Library for UI and Convex’s testing utilities for backend logic as they are adopted.
- Always run `pnpm lint` and `pnpm type-check`; they serve as the current quality gate before opening a PR.

## Commit & Pull Request Guidelines

- Follow the existing conventional commit style (`feat:`, `fix:`, `docs:`); keep subjects imperative and under ~70 characters.
- Reference related issues or product docs in the PR description and note required env keys or migrations.
- Include screenshots or short clips when UI changes are visible, and call out impacts to data access or authentication flows.
