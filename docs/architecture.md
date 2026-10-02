# Architecture overview

See [Frontend handover](./handover.md) for the route inventory, environment,
deployment, and open risks.

## Application boundaries

The Next.js 15 App Router tree has two main branches:

- `src/app/(site)` renders the commerce website. Its layout provides the
  document, NextAuth session provider, TanStack Query client, theme, and shared
  UI overlays. Nested route groups provide auth, checkout, admin, and main site
  layouts.
- `src/app/(payload)` hosts Payload Admin and CMS API routes. Payload owns only
  editorial Resources content and media. The external commerce API owns users,
  casks, orders, checkout, and payouts.

Parenthesized route groups are organizational and do not change the URL.
Underscore-prefixed App Router folders are private and do not create routes.

## Commerce request flow

```text
Browser action → feature module → TanStack Query → src/services (Axios)
                                             → commerce backend

Route/server render → src/services/server-action (Fetch)
                    → commerce backend → Query hydration → client module
```

`src/config/axios.ts` owns browser token attachment and refresh handling.
`src/services/server-action/base.ts` reads the server session and handles server
fetches. Endpoint paths and stable query key constants are under
`src/lib/constants`. Zustand stores in `src/store` and feature providers hold
client workflow state; derive display values from query data where possible.

Notifications use SSE in `src/hooks/useNotificationStream.ts`; browser
notifications and Resources Live Preview share `public/sw.js`. Market realtime
data has a separate Socket.IO client in `src/services/socket`.

## Authentication and authorization

`src/config/auth.ts` configures a credentials-based NextAuth JWT session backed
by the commerce auth service. `src/middleware.ts` protects most site routes,
refreshes expired tokens, and checks the commerce `Admin` role for `/admin` and
the `/cms-admin` UI. Payload additionally has its own `cms-users` accounts and
collection access rules. Server APIs must still enforce authorization; route
and component guards only control the frontend experience.

## Resources request flow

```text
Resources route → ResourceService → Payload Local API → PostgreSQL
                                  ↘ media: S3 when configured, local otherwise
```

`src/payload/services/ResourceService.ts` is server-only, validates public
response shapes, and reads published documents. Content schemas, access rules,
hooks, and migrations are under `src/payload`. See [Resources](./resources.md)
for the content model and Live Preview path.

## Trading and checkout

`src/modules/market-orders` owns shared order definitions, flow state,
adapters, editors, and management overlays. Checkout route state is read from
the commerce API by `src/app/(site)/(checkout)/checkout/[sessionId]`; the step
UI is in `src/modules/checkoutv2`. The backend is the source of truth for
settlement, Stripe, and DocuSign status. See the [market orders
specification](./market-orders-core-business.md) and the risk register in the
[handover](./handover.md).
