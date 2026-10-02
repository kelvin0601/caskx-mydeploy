# Services and API boundaries

See [Frontend handover](./handover.md) for the current architecture and known
risks. This document describes service ownership; it is not a backend API
specification.

## Commerce browser services

Browser features call `src/services/*.ts` through TanStack Query. These
services use the shared Axios instance in `src/config/axios.ts`; components
should not create their own Axios calls. Relevant service files include:

| Area                      | Service files                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| Auth and security         | `auth.ts`, `auth-2fa.ts`, `security.ts`                                                        |
| Casks and market          | `cask.ts`, `cask-master.ts`, `cask-ask.ts`, `cask-bid.ts`, `market-order.ts`, `market-data.ts` |
| Settlement                | `checkout.ts`, `payout.ts`, `seller-payout.ts`, `stripe.ts`, `docusign.ts`                     |
| Account and notifications | `notification.ts`, `notification-preference.ts`, `browser-notification.ts`                     |

`src/lib/constants/path.ts` owns API path fragments and
`src/lib/constants/key.ts` owns many query and endpoint keys. Include response
parameters in TanStack Query keys and invalidate the narrowest stable key
after a mutation. `src/services/socket` handles the realtime market
connection.

## Commerce server services

Server components call `src/services/server-action/*`, which extends
`BaseServerAction` and uses Fetch with the current server session. This
directory name does not mean every method is a Next.js `"use server"`
action. Keep browser auth utilities out of server components.

The checkout route combines server prefetch from
`server-action/checkout.ts` with browser services in `checkout.ts`. The
commerce backend remains authoritative for payment and agreement state.
Confirm any state-changing endpoint's semantics with the backend before
prefetching or retrying it.

## Payload services

`src/payload/services/ResourceService.ts` is the server-only read boundary for
published Resources content. `PayloadCmsApi.ts` guards CMS REST handlers with
`PAYLOAD_CMS_ENABLED`. Payload collections, access rules, and generated types
live under `src/payload` and `src/payload-types.ts`. See
[Resources](./resources.md) for the content and media model.

## Frontend route handlers

`src/app/api-fe` contains NextAuth and app-owned route handlers, including
file download/proxy routes. `src/app/(payload)` mounts CMS handlers. The
external commerce API is not implemented here. This repository does not
contain Stripe or DocuSign webhook handlers; consult backend documentation
for their event contracts.
