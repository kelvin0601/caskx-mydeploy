# Frontend handover

This is the entry point for handing over the current Cask Exchange frontend.
It records what is visible in this repository as of 30 September 2026. Follow
the linked source files for implementation details. Production settings,
credentials, service ownership, and rollback instructions require confirmation
from the operations and backend teams.

## Start here

1. Install dependencies with `npm ci --legacy-peer-deps` (the Docker build uses
   this command).
2. Create a local environment from `.env.example`. Get values through the
   team's secret manager; do not copy production values into documentation.
3. Run `npm run dev` and open `http://localhost:3001`.
4. For checks, use `npx tsc --noEmit --pretty false`, targeted `npx eslint`,
   targeted `npx prettier --check`, and `git diff --check`. Jest and Playwright
   commands are listed in `package.json` and `docs/testing.md`.

The development server uses port 3001. The Docker image exposes port 3000;
the host/container port mapping is owned by the deployment configuration.
`npm run build` first runs the destructive `clean` script and then
`npm run build:prod`. Do not use it to inspect an unrelated dirty worktree.

## System boundaries

| Area                                                | Source of truth                                        | Frontend entry points                                                     |
| --------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| Commerce identity, casks, orders, checkout, payouts | External commerce API                                  | `src/services`, `src/services/server-action`, `src/lib/constants/path.ts` |
| Web session and route access                        | NextAuth JWT plus middleware                           | `src/config/auth.ts`, `src/lib/auth-middleware.ts`, `src/middleware.ts`   |
| Editorial Resources and media                       | Payload CMS with PostgreSQL and optional S3            | `src/payload.config.ts`, `src/payload`, `src/app/(payload)`               |
| Browser state and server cache                      | Zustand, React Context, TanStack Query                 | `src/store`, feature providers, `src/lib/get-query-client.ts`             |
| UI                                                  | Next.js App Router, feature modules, shared components | `src/app/(site)`, `src/modules`, `src/components`                         |

The app does not contain the commerce backend or its Stripe/DocuSign webhooks.
Use backend contracts and operations documentation to confirm external effects.
`docs/architecture.md` describes the request flow in more detail.

## Route and source map

Route groups in parentheses do not appear in URLs. In the current tree,
`src/app/(site)/layout.tsx` provides the site document and client providers;
`src/app/(payload)` provides the CMS layout and routes.

| URL or area                                                      | Route group                   | Main implementation                                                                    |
| ---------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| `/`, `/marketplace`, `/distillery`, `/search`                    | `(site)/(root)`               | `src/modules/home`, `cask-listing`, `distilleries`, `search-results`                   |
| `/log-in`, `/sign-up`, recovery and verification                 | `(site)/(auth)`               | `src/modules/login`, `signup`, `forgot-password`, `reset-password`, `verify`           |
| `/buying/bids`, `/buying/payments`, `/selling/asks`              | `(site)/(root)/(manage-cask)` | `src/modules/mange-cask`, `src/modules/market-orders`                                  |
| `/profile`, `/settings`, `/notifications`, `/payout/[sessionId]` | `(site)/(root)`               | `src/modules/profile*`, `account`, `security`, `notification-inbox`, `profile-listing` |
| `/checkout/[sessionId]` and its step URLs                        | `(site)/(checkout)`           | `src/modules/checkoutv2`, `src/services/checkout.ts`                                   |
| `/admin/...`                                                     | `(site)/(admin)`              | `src/modules/dashboard`, `src/layouts/DashboardLayout`                                 |
| `/resources/...`                                                 | `(site)/(root)`               | `src/modules/resources`, `src/payload/services/ResourceService.ts`                     |
| `/cms-admin`, `/api-cms`, CMS GraphQL                            | `(payload)`                   | `src/payload.config.ts`, `src/payload/collections`                                     |
| `/api-fe/...`                                                    | `src/app/api-fe`              | NextAuth and frontend route handlers                                                   |

`src/app/(site)/(root)/_checkout` and `portfolio/_page.tsx` are private App
Router files, not public routes. `src/modules/_checkout` and
`src/modules/checkout` coexist with the active `checkoutv2` route; inspect
imports before modifying or deleting them. `src/feat` currently has no source
files. Do not infer that every directory is an active feature.

### Where to put a change

- Route parameters, metadata, server prefetch: `src/app/(site)`.
- Feature screen and feature-local UI: `src/modules/<feature>`.
- Reusable UI primitives: `src/components/ui`; shared product components:
  `src/components/shared`.
- Browser commerce calls: `src/services` through `src/config/axios.ts` and
  TanStack Query. Server reads: `src/services/server-action` through
  `BaseServerAction`.
- API paths and query keys: `src/lib/constants/path.ts` and `key.ts`; shared
  domain contracts: `src/types`.
- Resources schema, access, migrations, public reads: `src/payload`; keep CMS
  contract types separate from commerce types.

## Runtime flows to trace first

### Authentication and data

The credentials provider in `src/config/auth.ts` calls the commerce auth
service and stores access/refresh tokens in a NextAuth JWT. `src/middleware.ts`
checks route access and refreshes tokens; the site layout provides
`SessionProvider` and `QueryClientProvider`. The `(root)` and `(checkout)`
layouts prefetch the current user into TanStack Query. Browser requests pass
through the Axios instance; server requests use `BaseServerAction` and the
server session. A client guard is only a UI guard; the backend must enforce
authorization.

### Verification, notifications, and realtime data

Account verification and 2FA UI live in `src/modules/verify`, `kyc`, and
`security`; Stripe Connect onboarding is under the settings routes. Check the
canonical commerce auth/verification state before enabling guarded purchase or
sale actions. Browser notification preferences and inbox calls use
`src/services/notification*.ts`. `src/layouts/MainLayout/MainLayout.tsx`
subscribes to the notification SSE stream through
`src/hooks/useNotificationStream.ts`, which updates or invalidates TanStack
Query notification data. The stream constructs its URL from
`NEXT_PUBLIC_DOMAIN_TEST`; this variable must be checked when configuring an
environment. `src/services/browser-notification.ts` registers `public/sw.js`
for browser notifications. Market realtime traffic uses the separate Socket.IO
client under `src/services/socket`.

### Trading, checkout, and payout

`src/modules/market-orders` owns the current order definitions, adapters,
flow state, shared editor, and management overlays. The buy/sell submit hooks
call `src/services/market-order.ts`; the profile and manage-cask areas consume
those shared pieces. See `docs/market-orders-core-business.md` for the detailed
domain specification, and check its completion-status section before treating
planned behavior as shipped.

`/checkout/[sessionId]` loads the canonical status and redirects to the
current step. The `[slug]` route chooses seller confirmation, deposit payment,
agreement signing, invoice payment, or ownership transfer. Its server
prefetches use `src/services/server-action/checkout.ts`; client steps use
`src/services/checkout.ts`. The commerce API is authoritative for status and
payment state. The `/payout/[sessionId]` route currently interprets that
parameter as an ask ID and renders `ProfileListingDetail`; confirm this naming
with the backend before changing the URL contract.

### Resources and CMS

`/resources` reads published content with the server-only `ResourceService`.
Payload collections and globals are under `src/payload`; public reads filter
for published documents. The CMS Admin is at `/cms-admin`, and the middleware
also requires a commerce `Admin` session to reach that UI. Payload has its own
`cms-users` authentication and access roles. The CMS feature flag is
`PAYLOAD_CMS_ENABLED`. PostgreSQL uses `DATABASE_URI`; media uses S3 when
`S3_BUCKET` is set and local storage otherwise. The committed migrations are
under `src/payload/migrations`. See `docs/resources.md` for content setup,
preview behavior, and migration detail.

## Environment and deployment

| Group                | Variables to account for                                                                                | Source                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Commerce/API         | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_DOMAIN_TEST`, `NEXT_PUBLIC_SERVICE_URL`                             | `src/config/env.ts`, `next.config.ts`                |
| Web authentication   | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, optional `NEXTAUTH_URL_INTERNAL`                                     | `src/config/env.ts`, `src/config/auth.ts`            |
| Browser integrations | `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, `NEXT_PUBLIC_WS_URL`                                                   | `src/config/env.ts`                                  |
| CMS                  | `PAYLOAD_CMS_ENABLED`, `DATABASE_URI`, `PAYLOAD_SECRET`, `PAYLOAD_SERVER_URL`                           | `src/payload.config.ts`                              |
| CMS media            | `S3_BUCKET`, `S3_REGION`, `S3_PREFIX`, optional credentials/endpoint                                    | `src/payload/storage.ts`, `src/payload/constants.ts` |
| Diagnostics          | `NEXTAUTH_DEBUG`, `NEXT_PUBLIC_ENABLE_REACT_SCAN`, `NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS`, `ANALYZE` | config files                                         |

`.env.example` is a starting list, not a complete inventory of variables
referenced by source. Check every integration before deployment. Never put a
server secret in a `NEXT_PUBLIC_` variable. Payload requires an explicit
`PAYLOAD_SERVER_URL` and a sufficiently long `PAYLOAD_SECRET` when enabled in
production; see the validation in `src/payload.config.ts`.

`Dockerfile` builds a standalone Next.js image. A push to `staging` invokes
`.github/workflows/staging.yml`, which builds/tests an image and deploys over
SSH to an EC2 Docker Compose host. A push to `production` invokes
`.github/workflows/production.yml`, which pushes to ECR and forces an ECS
service deployment. The deployment workflows contain no CMS migration step
and do not describe secret rotation or rollback. Confirm the runtime
environment, database migration procedure, and previous image/task rollback
procedure with operations before a CMS production release. These are
operational gaps, not instructions to run a migration automatically.

## Known risks and follow-up

These are source-review findings, not confirmation of an exploit or a failed
production transaction.

| Priority | Finding and evidence                                                                                                                                | Required follow-up                                                                                                           |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| P0       | `src/app/api-fe/proxy/route.ts` and `download/route.ts` fetch a caller-supplied URL without a host allowlist.                                       | Restrict targets and redirects, bound response size/time, and confirm whether both routes are still needed.                  |
| P1       | The checkout `[slug]` page and `SignAgreement.tsx` call the `sign-agreement` POST with `agreementAccepted: true` during page/query loading.         | Confirm backend semantics, then move any consent or state-changing action behind an explicit user action and use a mutation. |
| P1       | `src/config/auth.ts` logs the login response, and `src/middleware.ts` logs the refresh result, which includes an encoded session cookie on refresh. | Remove sensitive payload logging and review log retention.                                                                   |
| P2       | `src/config/axios.ts` keys GET cancellation by path without query parameters.                                                                       | Confirm independent lists cannot cancel each other; change keying/cleanup if needed.                                         |
| P2       | `.env.example`, README, older flow/service docs, and CI do not fully describe the current CMS and deployment setup.                                 | Reconcile with the real environments and keep this handover updated.                                                         |

Do not treat `docs/business-flows.md` or its endpoint examples as an API
contract; use the current services, constants, and backend contract. The
commerce backend, Stripe/DocuSign configuration, and deployed behavior were
not available for this source review.

## Handover completion checklist

- [ ] A new engineer can start the app at port 3001 with documented local
      variables and trace one commerce request through route, service, and API.
- [ ] A signed-in test user can verify notification inbox updates and the
      configured SSE connection without exposing session data in logs.
- [ ] Backend owner confirms the checkout signing API behavior, order and
      payout state transitions, and endpoint contract.
- [ ] Operations owner records staging/production URLs, secret ownership,
      monitoring, database backup/migration, rollback, and incident contacts in
      an access-controlled runbook.
- [ ] CMS owner confirms editor/admin provisioning, content migration status,
      media storage, and preview behavior.
- [ ] P0/P1 findings have tracked owners and a verified resolution before
      handover sign-off.

Update this document when a route, integration, deployment workflow, or
ownership boundary changes. Record the validation date and link the relevant
source or external runbook; do not duplicate credentials here.
