# PATTERNS

Generated: 2 Oct 2026, 11:01
Commit: 7946e620 (dirty)
Regenerate: npm run codemap

These patterns are derived from real files in this repo. If a reference path disappears, the section is flagged stale instead of silently drifting.

### Add a route page

Verified against: `src/app/(site)/(root)/marketplace/page.tsx`, `src/app/(site)/(root)/distillery/page.tsx`
Mirror: Keep the page thin. Let it import a feature module and keep route-specific data fetching in the page layer.
Steps:

1. Create `src/app/<segment>/page.tsx` for the route shell.
2. Import the matching module from `src/modules/<feature>/` instead of inlining the full screen.
3. Keep `layout.tsx` and route-group concerns in the nearest app segment.
   Not touched: `src/components/ui/*` - route assembly should not fork primitives.

### Add a feature module screen

Verified against: `src/modules/home/index.tsx`, `src/modules/cask-listing/index.tsx`
Mirror: The module owns orchestration. Split the UI into nested folders only when the screen starts to carry real complexity.
Steps:

1. Create `src/modules/<name>/index.tsx` as the entry surface.
2. Move reusable subpieces into sibling folders such as `banner/`, `sidebar/`, `forms/`, or `pages/`.
3. Keep cross-page primitives in `src/components/shared/` instead of duplicating them inside the module.
   Not touched: `src/app/*` - pages should stay as route shells, not feature implementations.

### Add a service plus server action

Verified against: `src/services/distilleries.ts`, `src/services/server-action/distillery.ts`
Mirror: Put network logic in `src/services/`, then wrap server-rendered data access in `src/services/server-action/` when a page prefetches through React Query.
Steps:

1. Add the API client function in `src/services/<domain>.ts`.
2. Add the server-action wrapper in `src/services/server-action/<domain>.ts` if the route prefetches data.
3. Reuse shared constants and query keys instead of hardcoding string literals in the page.
   Not touched: `src/modules/<name>/` - the module should consume the service, not duplicate it.

### Add a shared component

Verified against: `src/components/shared/distillery-card/index.tsx`, `src/components/shared/category-card/index.tsx`
Mirror: Shared components stay feature-neutral. If the component starts carrying product-specific logic, promote that logic back into the relevant module.
Steps:

1. Create `src/components/shared/<name>/index.tsx` for the shared surface.
2. Split internal subparts only if they are reused or independently testable.
3. Keep layout, sizing, and behavior generic enough to be reused by multiple modules.
   Not touched: `src/services/` - shared UI should not own API access.

### Add a Zustand slice

Verified against: `src/store/slices/authSlice.ts`, `src/store/slices/caskSlice.ts`
Mirror: Slices are small and focused. Keep data derivation near the slice and keep feature wiring in the provider or module that consumes it.
Steps:

1. Create `src/store/slices/<feature>Slice.ts` with a narrowly scoped state shape.
2. Export selectors or hooks from the local store entry point when multiple components need the same state.
3. Avoid baking server-fetched data flow into the slice unless the state is truly cross-route.
   Not touched: `src/components/ui/*` - primitives should not know about store internals.
