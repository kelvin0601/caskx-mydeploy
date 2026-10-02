# Cask Exchange Agent Guide

This file applies to the entire repository. A more specific `AGENTS.md` in a
subdirectory overrides these rules for that subtree.

## Project overview

- Framework: Next.js 15 App Router with React 19 and TypeScript in strict mode.
- Styling: Tailwind CSS with project tokens and custom responsive breakpoints.
- UI primitives: shadcn/Radix components in `src/components/ui`.
- Server state: TanStack React Query.
- Client state: Zustand stores in `src/store`.
- Forms: React Hook Form and Zod.
- HTTP: Axios client services and Fetch-based server-action services.
- Path alias: use `@/*` for imports from `src`.

## Repository structure

- `src/app`: routes, layouts, route-level metadata, server prefetching, and
  hydration boundaries.
- `src/modules`: feature screens and feature-local components.
- `src/components/ui`: reusable shadcn/Radix primitives. Do not duplicate
  primitives inside feature modules.
- `src/components/shared`: reusable product components shared across features.
- `src/layouts`: application and dashboard shells.
- `src/services`: browser/client API services using the configured Axios
  instance.
- `src/services/server-action`: server-only API access built on
  `BaseServerAction`.
- `src/lib/constants`: API paths, query keys, routes, text, and static options.
- `src/types`: shared domain types and API response contracts.
- `src/hooks`: shared hooks. Reuse these before introducing equivalent logic.
- `src/store`: Zustand slices and composed stores.

## Commands

The development server runs on port 3001:

```bash
npm run dev
```

Use targeted checks while working:

```bash
npx prettier --check path/to/file.tsx
npx eslint path/to/file.tsx
npx tsc --noEmit --pretty false
git diff --check
```

Use these when the affected scope warrants them:

```bash
npm test -- --runInBand
npm run build:prod
```

Do not run formatting or autofix across the entire repository unless the task
explicitly requires a repository-wide rewrite. Existing unrelated changes
belong to the user and must be preserved.

## Implementation workflow

1. Inspect the route, feature module, shared components, service, constants,
   and domain types involved in the requested flow.
2. Search for an existing implementation in a sibling listing/detail screen
   before creating a new pattern.
3. Make the smallest cohesive change that completes the behavior.
4. Preserve unrelated dirty-worktree changes and do not revert user work.
5. Verify changed files with Prettier, ESLint, TypeScript, and
   `git diff --check`.
6. Report the behavior changed and the checks that passed.

## TypeScript and React

- Keep TypeScript strict. Do not introduce `any`, unsafe casts, or fake API
  fields to make a component compile.
- Use domain types from `src/types`; extend them only when the backend contract
  actually contains the additional fields.
- Prefer derived values during render over effects that synchronize derived
  state.
- Keep hook dependencies correct. Do not suppress hook dependency warnings to
  hide stale closures.
- Hoist static constants and option arrays outside components.
- Use immutable transforms such as `toSorted()` when sorting client-side data.
- Do not define React components inside another component.
- Add `"use client"` only when the file uses browser APIs, state, effects,
  event handlers, or client-only libraries.
- Keep route files and server components server-side when possible. Pass only
  the data needed by client components.
- Prefer CSS breakpoints over JavaScript viewport branching for presentation.

## Data fetching and API services

- Client components call services in `src/services` through TanStack React
  Query. Do not call Axios directly from a component.
- Server components call services in `src/services/server-action`. Do not
  import browser-only auth/session utilities into server components.
- Use endpoint constants from `src/lib/constants`; do not duplicate path
  strings in components.
- Use stable query-key constants and include every parameter that changes the
  response in the query key.
- Set `enabled` when a request is conditional. In tabbed screens, only the
  active tab may initiate its listing/detail request unless prefetching is an
  explicit requirement.
- Give independent requests independent query keys. Do not reuse a key across
  different response shapes.
- Use listing endpoints for listing/search screens. Add `search`, `sortBy`,
  `sortOrder`, `page`, and `size` as query parameters rather than switching to
  an unrelated endpoint.
- Omit `search` when the search input is empty so the normal listing remains
  visible.
- Sorting for listing pages is server-side. Reuse the listing sort options and
  send both `sortBy` and `sortOrder`; do not replace it with a small hardcoded
  client-side sort.
- Debounce text search before changing the query key or URL.
- Use `getErrorMessage` for user-facing API errors and keep a useful fallback.
- Mutations must invalidate the narrowest stable query key that owns the
  changed data.
- Do not add manual duplicate-request cancellation in feature code; the shared
  Axios configuration already manages active GET requests.

## URL and navigation state

- Search, filters, sorting, tabs when shareable, and pagination should be
  reflected in URL search parameters.
- Use `PARAMS` and route constants rather than raw parameter or route names.
- Preserve unrelated URL parameters when updating one control.
- Reset pagination to page 1 when search, filters, sorting, or the active data
  domain changes.
- Use Next.js `Link` for navigation and the router for programmatic workflow
  transitions. Do not navigate with a clickable `div`.

## Components and styling

- Reuse existing shared components, shadcn primitives, icons, and design tokens
  before creating new ones.
- Compose class names with `cn()` when classes are conditional.
- Use project color and typography tokens such as `bg-bg-main`,
  `border-bd-main`, and `text-typo-primary`; avoid one-off hex colors when a
  token exists.
- Responsive breakpoints are defined in `tailwind.config.ts`:
    - `tb`: max-width 1024px.
    - `j-tb`: 768px through 1024px.
    - `mb`: max-width 767px.
- Flex and grid children containing text must use `min-w-0`, with `truncate`,
  `line-clamp-*`, or `break-words` appropriate to the design.
- Skeletons must match the final component's layout, breakpoint behavior,
  spacing, and major dimensions. Do not use desktop skeletons for mobile or a
  cask skeleton for a distillery card.
- Loading, empty, and error states must preserve the screen layout and must not
  flash unrelated content during state transitions.
- Icon-only buttons need an accessible name. Decorative icons use
  `aria-hidden="true"`.
- Interactive elements need visible `focus-visible` styles and touch targets
  appropriate for mobile.
- Use `aspect-square` for square media. Images must have meaningful `alt`,
  explicit dimensions, and the correct lazy/priority behavior.

## Dashboard responsive grids

- In `src/modules/dashboard` and `src/layouts/DashboardLayout`, arbitrary
  `grid-cols-[...]` tracks must use fractional `fr` values. Prefer
  `minmax(0, nfr)` for tracks containing text.
- Do not use `px`, `rem`, fixed Tailwind width tokens, or `auto` for dashboard
  grid tracks. ESLint enforces `px`, `rem`, and `auto` violations.
- Keep fixed image, icon, button, switch, and control dimensions inside their
  grid cells; the parent column layout remains fractional.
- Images inside fractional cells use `aspect-square`, responsive width, and a
  `max-w-*` limit. Do not use a fixed `size-*` wrapper that can be clipped by a
  narrower fractional track.
- Define one shared grid-column constant per table and reuse it for the table
  header, data rows, empty/loading rows, and skeleton rows.
- At narrow breakpoints, hide secondary columns and rebalance the remaining
  tracks. Do not preserve a compressed desktop table by forcing horizontal
  overflow unless the design explicitly requires a scrollable data table.
- When rows use CSS Grid, make the surrounding table sections consistently
  block-level where necessary so native table intrinsic sizing cannot override
  the grid tracks.

## Authentication and transaction guards

- Treat verification, payment readiness, and permission checks as asynchronous
  state. A click must not open a downstream purchase/sale/payment dialog while
  the prerequisite query is still pending.
- Do not make authorization decisions from stale cached UI state when a
  canonical auth/query state is available.
- Disable or defer guarded actions until prerequisite state is resolved, then
  evaluate the latest state inside the action handler.
- Server actions still validate authentication and authorization; client guards
  are UX protection, not the security boundary.

## File and change safety

- Use `apply_patch` for manual file edits.
- Do not delete, reset, or overwrite unrelated files.
- Never use destructive Git commands to clean a dirty worktree.
- Do not change API contracts, shared primitives, or global styling solely to
  work around a feature-local issue unless all consumers have been checked.
- Avoid editing generated files and build output such as `.next`.

## Definition of done

- The requested behavior is implemented for loading, success, empty, error,
  and relevant conditional states.
- Desktop, tablet, and mobile layouts remain usable.
- API calls use the correct service, endpoint, parameters, and query keys.
- Keyboard, focus, labels, and image accessibility remain intact.
- Changed files pass targeted Prettier and ESLint checks.
- The repository passes TypeScript validation.
- `git diff --check` reports no whitespace errors.
