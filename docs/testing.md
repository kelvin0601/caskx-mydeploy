# Validation and testing

Use the smallest check that covers the changed area. Commands below reflect
`package.json`, `jest.config.ts`, `playwright.config.ts`, and `AGENTS.md`.

## Source and documentation checks

```bash
npx prettier --check path/to/changed-file
npx eslint path/to/changed-file.tsx
npx tsc --noEmit --pretty false
git diff --check
```

`npm run lint` invokes `next lint --fix`, so it may modify files. Use targeted
`npx eslint` for a read-only check. The Husky pre-commit hook also builds,
generates context files, formats staged files, and runs lint and TypeScript;
inspect its effects before committing an unrelated worktree.

## Automated tests

Jest and React Testing Library cover utilities, components, hooks, commerce
flows, Payload access, and Resources behavior under `src/__tests__`.
Playwright scenarios are under `e2e/` and use port 3001 by default.

```bash
npm test -- --runInBand
npm test -- --runInBand path/to/test-file.test.ts
npm run test:e2e
npm run build:prod
```

Run the broader suites when the affected scope warrants them. Playwright loads
`.env.local` and `.env`; authenticated scenarios need the E2E credentials
listed in `.env.example`. A production build may require valid integration
configuration, especially when Payload CMS is enabled.

## Manual handover walkthrough

With appropriate test accounts and non-production services:

1. Sign in and verify token refresh, logout, and protected route behavior.
2. Browse and search marketplace listings; open a cask detail and an order
   flow with its loading/error states.
3. Visit a checkout session and verify status-based redirects and each
   permitted step against the commerce backend.
4. Browse published Resources, use search and topic/FAQ pages, then verify CMS
   draft/publish and preview with an authorized editor account.
5. Check the admin dashboard and payouts with the correct roles.

Do not perform real financial actions during a handover walkthrough. Record
the environment, test identities, observed result, and backend confirmation
for every state-changing flow.
