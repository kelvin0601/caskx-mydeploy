# Cask Exchange AI Assistant Guidelines (GEMINI.md)

Welcome to the Cask Exchange front-end repository. Below are the rules, patterns, and guidelines you must follow when editing code, generating new modules, or refactoring.

---

## 1. Tech Stack & Project Architecture

- **Framework**: Next.js 15 (App Router) + React 19.
- **Language**: Strict TypeScript. Always define clear interfaces or types. Do not use `any` under any circumstances (strictly forbidden; prefer generic parameters, proper interface definitions, or `unknown` instead).
- **Styling**: Tailwind CSS + custom theme tokens (`tailwind.config.ts`).
- **State Management**:
    - **Zustand**: `useBoundStore` (from `@/store`) for global client-side state (auth, session details, etc.).
    - **React Context**: Used for scoped UI states (e.g., `CaskProvider` inside `modules/mange-cask`).
    - **TanStack Query**: For caching and sharing server/client fetched data.
- **Forms**: React Hook Form + Zod validation schemas.
- **Auth**: NextAuth.js (credentials and JWT) + 2FA flows.

---

## 2. Directory & Structure Rules

All code must be organized according to our modular directory structure:

- `src/app/`: Handles Next.js routing and server-rendered layout/page wrappers.
- `src/modules/`: High-level product features (e.g., `account`, `payout`, `mange-cask`, `distilleries`).
    - Write page components inside `src/modules/<feature>/pages/` or `src/modules/<feature>/index.tsx`.
    - Write feature-specific components inside `src/modules/<feature>/components/` or `src/modules/<feature>/forms/`.
- `src/components/shared/`: Shared composite UI features (Auth forms, header/footer, common list elements).
- `src/components/ui/`: Base UI primitives (Button, Input, Accordion, Badge, Dialog) following shadcn patterns.
- `src/services/`: API client services wrapper hitting backend endpoints.
- `src/hooks/`: Global reusable custom hooks.

---

## 3. Data Fetching & State Hydration Best Practices

To prevent layout shifts, hydration warnings, or UI flickering:

- **Server Renders & Prefetching**: Prefetch details on the server-side using Server Actions extending `BaseServerAction`.
- **Query Key Alignment**: Client-side TanStack `useQuery` hooks must use the **exact same query keys** as the server-side prefetch.
- **Immediate Parameter Fallback**: Avoid initializing hooks or filters with `undefined` on early renders. Accept resolved server properties (like `activeId`) as props, and use them as instant fallbacks for Zustand variables to guarantee clean hydration.

---

## 4. Stripe Integration & Verification Logic

When auditing or refining Stripe Onboarding/Update forms:

- **Forms Separation**:
    - [PersonalDetailsForm.tsx](file:///Users/bearplus/Documents/bearplus/cask-exchange-bp/src/modules/account/forms/PersonalDetailsForm.tsx) for individual/proprietor account details.
    - [PersonForm.tsx](file:///Users/bearplus/Documents/bearplus/cask-exchange-bp/src/modules/account/forms/PersonForm.tsx) for representatives, directors, executives, or owners of companies.
- **Strict Verification Check (Stripe Requirements API)**:
    - Never rely on loose string matching (like checking human-readable details) alone.
    - For **Individuals**, query if the Stripe Account requirements have active due items:
        ```typescript
        const requirements = profile?.rawStripeData?.requirements;
        const isVerificationDue =
            requirements?.currently_due?.some((r) =>
                r.includes("individual.verification")
            ) ||
            requirements?.past_due?.some((r) =>
                r.includes("individual.verification")
            );
        ```
    - For **Company Persons**, check their status using our utility:
        ```typescript
        import { handleGetCardStatusStripePerson } from "@/lib/utils";
        const isUnverified =
            handleGetCardStatusStripePerson(personCurrent) !== "Complete";
        ```
- **User Restriction**: Always limit verification alerts to the currently logged-in user (`user?.email === targetPerson?.email`) to prevent displaying verification action banners for representatives edit views belonging to other users.

---

## 5. UI & Styling Guidelines

- **Aesthetics**: Wow the user with curated modern aesthetics. Use vibrant and harmonious colors, dark/light modes via `next-themes`, clean typography (Outfit, Reckless, Inter), smooth micro-animations, hover transitions, and glassmorphism. q
- **Tailwind Sizing & Spacing**: Always use standard Tailwind size classes (e.g., `w-4`, `h-4`, `p-6`, `m-2`) instead of hardcoding raw pixel values (e.g., `w-[16px]`) or arbitrary `rem` values (e.g., `w-[1rem]`), unless there is no predefined spacing token for them.
- **Colors**: Use custom styling tokens defined in `tailwind.config.ts` (such as `typo.primary`, `bd.main`, `bg.main`, `brand`) rather than raw hex/rgb codes or standard Tailwind colors to guarantee correct theme switching and dark mode support.
    - **Design System Tokens**:
        - **Typography**: `--text-strong` / `--text-dark-strong` (or theme-aware `text-typo-primary` / `dark:text-typo-dark-primary`), mapping to design tokens `Strong`, `Sub`, `Soft`, `Note`, `Disable`.
        - **Background**: `--bg-main` / `--bg-dark-main`, mapping to design tokens `Main`, `surface1`, `surface2`, `surface3`, `surface4`, `inverse`.
        - _Always prefer using the theme-aware variables (e.g. `text-typo-primary` / `bg-bg-main`) unless explicitly targeting a specific mode._
- **Breakpoints**: Utilize project-specific breakpoints (`dk:`, `tb:`, `mb:`) defined in the Tailwind config for responsive styling.
- **No Placeholders**: Never write dummy placeholder assets or mock texts. Use actual generated UI imagery or standard icon libraries.

---

## 6. Testing & Build Rules

- **Unit Tests**: Located inside `src/__tests__/`. Run with `npm test`.
- **Jest-DOM Types**: Ensure `@testing-library/jest-dom` is globally imported at [jest.setup-after.ts](file:///Users/bearplus/Documents/bearplus/cask-exchange-bp/jest.setup-after.ts) so matchers like `toBeInTheDocument()` have full compiler support.
- **Type Safety Verification**: Prior to committing or proposing changes, verify TypeScript compilation using:
    ```bash
    npx tsc --noEmit
    ```

---

## 7. Form & Custom Hook Best Practices

- **Generic Signatures**: When writing hooks for forms, API wrappers, or mutations (like `useAuthForm`), always use generic type parameters for success handlers or return values. Never type these as `any` or default them to `any` (e.g., `onSuccess?: (d: R) => void` where `R` is a generic variable).
- **Secure/Conditional Fields**: For fields containing sensitive client data (e.g., `ssnLast4`), check fields like `ssn_last_4_provided` returned by Stripe to hide or disable fields once they have been provided. This prevents the client from accidentally overwriting secure stored values on subsequent form submissions.

---

## 8. Filter & Listing Page Patterns

- **Active Filter Badges**: Provide removable active filter tags at the top of filter sidebars or grids to give the user a clear summary of their selected parameters.
- **State Synchronization**: Deleting a filter tag or clicking "Clear" must:
    1. Revert the corresponding react-hook-form value to its initial or default option state.
    2. Sync changes back to the URL search parameters to ensure bookmarkability and prevent layout inconsistencies.
- **Performance & Hooks**: Memoize tag generation logic using `useMemo` and wrap reset handlers/remove actions using `useCallback` to avoid unnecessary renders and keep interactions smooth.

---

## 9. Store Slices & State Patterns

- **Combining Slices**: Global state is divided into slices in `src/store/slices/` (e.g., `authSlice.ts`, `caskSlice.ts`) using Zustand's `StateCreator`. Slices are combined into `useBoundStore` at `src/store/index.ts`.
- **Slice Definitions**: Slices must have explicit type bindings to prevent TypeScript implicit conversions:

    ```typescript
    import { StateCreator } from "zustand";
    import { store } from "@/types/store";

    export const createAuthSlice: StateCreator<store.TAuth, []> = (set) => ({
        user: null,
        isLogin: false,
        setMyUser: (user) => set({ user, isLogin: !!user }),
        reset: () => set({ user: null, isLogin: false }),
    });
    ```

- **Context-Bound Providers**: Use React Context (`CaskProvider` or `AccountProvider`) when state is scoped to a specific workflow (e.g., forms sub-steps or dialog controllers) to prevent cluttering the global store.

---

## 10. Server Actions & Token Refresh Logic

- **Subclassing BaseServerAction**: All server-side data fetching and processing must subclass `BaseServerAction` in `src/services/server-action/`. This abstracts token retrieval, HTTP request handling, and authentication redirects.
- **Token Maintenance**: Actions must utilize the `fetch` and `handleRequest` pipeline:
    - Automatically retrieves the authentication token from `getServerSession(OptionNextAuth())`.
    - Handles token refreshing (`tryRefreshToken`) automatically upon receiving `401 Unauthorized` responses.
    - Redirects users automatically to `ROUTE_AUTH.LOGIN` upon refresh failure or invalid credentials.

---

## 11. Form Delta Detection & Selective Submissions

- **Change Trackers**: For pages or workflows with complex forms (such as settings, security, or edit modes), utilize the `useFormChangeDetector` hook to evaluate changes.
- **Delta Submissions**: To prevent overwriting unedited parameters on the server and to optimize network payload size, use `getChangedValues` to retrieve and submit only modified fields rather than transmitting the complete form state on API updates.

---

## 12. TanStack Query Cache Subscriptions

- **Cache Observers**: When you need to read, sync, or trigger updates based on query cache values without invoking full `useQuery` hooks, use `useGetStateQuery(key, fetchFn)`.
- **Query Subscriptions**: This hook subscribes to cache changes via the Query Cache subscription client, updating states reactively and executing fallback fetches when no cached records are found.

---

## 13. Multi-Step Form Transitions & Wizard Flows

- **Animation Transitions**: Multi-step forms (such as KYC steps, wallet bank registration, etc.) must transition using `AnimatePresence` and `SlideTransition`.
- **Direction Handling**: Track `isBackAction` in the step provider to dynamically alternate between left-slide and right-slide transitions when users advance or navigate backward.
- **Grid Layout Overlaps**: Keep wizard containers structured under overlapping CSS grids (`grid-cols-1 grid-rows-1 [&>*]:col-start-1 [&>*]:row-start-1`) so transitioning components mount and exit on the same layer without causing layout jumps.
