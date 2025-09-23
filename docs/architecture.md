## T1 Architecture Scope

This ticket establishes the baseline scaffold for a Next.js 14 app using the App Router with strict TypeScript, TailwindCSS, ESLint + Prettier, Vitest + Testing Library, Husky + lint-staged, and a minimal Prisma probe. There is no business logic in T1. The Prisma probe defines a minimal model and validates/generates types, but the app does not connect to a database or run migrations.

CI ensures code quality by running generate/validate, lint, typecheck, and tests on Node 22 using pnpm. Husky pre-commit enforces local checks via lint-staged to keep commits clean.
