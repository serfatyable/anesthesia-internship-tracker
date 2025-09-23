## T1 Test Checklist

- Dev server boots and root page renders with Tailwind styling
- ESLint passes via `pnpm lint`
- TypeScript strict typecheck passes via `pnpm typecheck`
- Vitest runs and the smoke test passes
- Husky pre-commit triggers lint-staged and blocks failing commits
- CI runs the full workflow with Node 22 and pnpm cache
- Prisma validate and generate succeed without DB connection
