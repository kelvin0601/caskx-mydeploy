# Project structure

This map describes the current source tree. See [Frontend
handover](./handover.md) for routes, runtime flows, and operational details.

```text
src/
├── app/
│   ├── (site)/                 # Web document and route groups
│   │   ├── (auth)/             # Login, registration, recovery
│   │   ├── (root)/             # Marketplace, profile, resources, settings
│   │   ├── (checkout)/         # Current checkout route
│   │   ├── (admin)/            # Commerce admin dashboard
│   │   └── (empty)/            # DocuSign return and isolated pages
│   ├── (payload)/              # Payload Admin and CMS API routes
│   └── api-fe/                 # Frontend auth, proxy, download handlers
├── payload.config.ts           # Payload/PostgreSQL configuration
├── payload/                  # Collections, access, migrations, media, services
├── modules/                  # Feature screens and feature-local UI
├── components/ui/            # shadcn/Radix primitives
├── components/shared/        # Shared product components
├── layouts/                  # Route shells and navigation
├── services/                 # Browser commerce API services
│   ├── server-action/        # Server-side commerce API access
│   └── socket/               # Realtime market connection
├── config/                   # Axios, NextAuth, environment, Query config
├── lib/constants/            # Routes, API paths, query keys, text
├── lib/server/               # Server-only checkout/user helpers
├── hooks/                    # Shared hooks
├── store/                    # Zustand state and providers
├── types/                    # Commerce contracts
├── assets/                   # Styles and content templates
└── __tests__/                # Unit/component tests, including CMS tests
```

`src/modules/market-orders` is the active shared trading boundary.
`src/modules/checkoutv2` backs the current checkout route. The
underscore-prefixed `_checkout` folders and `portfolio/_page.tsx` in the App
Router are private files, so they do not create public URLs. Older module
folders may still be imported; check references before cleanup.

At the repository root, `docs/` holds handover and domain documents,
`scripts/` holds code-map and Resources migration tools, `e2e/` holds
Playwright scenarios, `public/sw.js` handles browser notifications and Resources
Live Preview messages, `Dockerfile` defines the standalone image, and
`.github/workflows/` defines staging and production deployment triggers.
