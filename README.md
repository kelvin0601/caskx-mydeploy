# CASK EXCHANGE Front-End

Modern web application for the CASK EXCHANGE marketplace, built on the Next.js App Router stack with React 19, TypeScript, Tailwind CSS, and a modular feature architecture.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Key Features](#key-features)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Architecture & Data Flow](#architecture--data-flow)
7. [Styling](#styling)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Git Workflow](#git-workflow)
11. [Documentation](#documentation)
12. [Learn More](#learn-more)

## Project Overview

CASK EXCHANGE enables investors to discover, list, and settle cask trades. The front-end ships with:

- Landing, authentication, onboarding, and legal pages.
- Profile, wallet, payout, and notification flows for authenticated users.
- Extensive "Manage Cask" tooling (ask/bid updates, transaction history, release forms).
- Admin and dashboard experiences for internal teams.

The UI is optimized for performance (React Server Components + Suspense), accessibility, and maintainability.

## Tech Stack

| Layer           | Tools                                         |
| --------------- | --------------------------------------------- |
| Runtime         | Next.js 15 (App Router) + React 19            |
| Language        | TypeScript                                    |
| Styling         | Tailwind CSS + shadcn-inspired UI primitives  |
| State/Data      | TanStack Query, Zustand stores, React Context |
| Forms           | React Hook Form + Zod validation              |
| Auth            | NextAuth.js (credentials + JWT)               |
| Payments        | Stripe Connect                                |
| Build / Tooling | ESLint 9, Jest 29, Husky                      |

## Key Features

- **Marketplace browsing** (`modules/cask-listing`, `modules/cask-master-detail`) with live order book helpers.
- **Checkout & payments** (`modules/checkoutv2`, `modules/payout`) integrated with Stripe Connect.
- **Market orders** (`modules/market-orders`) with shared listing/offer editors and buy/sell flows.
- **Resources CMS** (`src/payload`) with published content, preview, and media storage.
- **Manage Cask** (`modules/mange-cask`) surfaces live asks/bids, transaction dialogs, release form actions, and custom hooks such as `useManageSellingTable`, `useManageTransactionHistory`.
- **Account, security, and KYC** modules to control profile, 2FA, wallet, and verification steps.
- **Admin dashboard** (`modules/dashboard`) powered by reusable hooks and shared UI pieces. The `modules/portfolio` folder does not currently have a public `/portfolio` route.

## Getting Started

### Prerequisites

- Node.js 20 (matches the Docker base image)
- npm (default) or yarn/pnpm

### Installation

```bash
git clone <repository-url>
cd cask-exchange-bp
npm ci --legacy-peer-deps
npm run dev
# open http://localhost:3001
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npx eslint path/to/file.tsx # Lint a changed file without autofix
```

Create `.env.local` from `.env.example` and obtain values from the team secret
manager. See [Frontend handover](./docs/handover.md) for the current environment
inventory and deployment gaps.

## Project Structure

```
src/
├── app/                # Next.js App Router (public + authenticated routes)
├── assets/             # Images, fonts, global styles
├── components/
│   ├── shared/         # Feature-oriented composites (auth, header, payout, …)
│   └── ui/             # Shadcn-like primitives (Button, Dialog, Table, Badge, …)
├── config/             # Auth, axios, theme, next-auth options
├── enum/               # Centralized enums (transaction status, checkout, etc.)
├── helpers/ & lib/     # Utility functions, formatting helpers, constants
├── hooks/              # Custom hooks (manage selling/buying tables, history, …)
├── layouts/            # Layout components used by app router segments
├── middleware.ts       # Route protection / localization / headers
├── modules/            # Feature modules (account, payout, mange-cask, wallet, …)
├── payload/            # CMS collections, access, migrations, and services
├── payload.config.ts   # Payload and PostgreSQL configuration
├── providers/          # Global providers (theme, query client, auth)
├── services/           # API service classes hitting backend endpoints
├── store/              # Zustand stores & selectors
└── types/              # TypeScript declarations (payout, transaction, etc.)
```

> The `modules/` folder mirrors product areas (e.g., `modules/payout/pages/ListedForSale.tsx`, `modules/mange-cask/components/dialog/dialog-transaction.tsx`). Shared hooks/components sit at `hooks/` and `components/shared/` to keep features decoupled.

## Architecture & Data Flow

- **Data fetching**: TanStack Query wraps service classes in `services/`, providing caching and background refresh (e.g., selling/ buying tables, payout summaries).
- **Client state**: Zustand stores inside `store/` handle cross-route state; React Context is used for feature workflow state.
- **Trading and settlement**: `modules/market-orders` owns shared order flows; `modules/checkoutv2` handles checkout steps and `modules/profile-listing` handles the current payout detail route.
- **Routing**: `src/app/(site)` contains the web app; `src/app/(payload)` contains CMS routes. Route groups do not appear in URLs.

## Styling

- Tailwind CSS with custom theme tokens (see `tailwind.config.ts`).
- Global styles under `src/assets/styles`.
- `next-themes` is configured with a forced light theme in the current site layout.
- UI primitives follow shadcn guidelines to keep typography/spacing consistent.

## Testing

- Jest + Testing Library
    - `npm test` – run once
    - `npm run test:watch` – watch mode
- The Husky pre-commit hook runs a build, staged-file formatting, linting, and TypeScript checks. Its `npm run lint` command uses autofix; use targeted `npx eslint` for read-only checks.

## Deployment

- Build: `npm run build:prod` (without the `clean` script used by `npm run build`)
- Start prod server locally: `npm start`
- The repository contains EC2 Docker Compose staging and ECS production GitHub Actions workflows. See [Frontend handover](./docs/handover.md) before deploying.

## Git Workflow

1. Agree the target branch with the team; the repository deploys pushes to
   `staging` and `production` through GitHub Actions.
2. Keep changes scoped and run targeted formatting, ESLint, and TypeScript
   checks before pushing.
3. Review deployment and migration requirements in the handover before merging
   into a deployment branch.

## Documentation

Comprehensive documentation is available in the [`/docs`](./docs) folder:

| Document                                               | Description                                     |
| ------------------------------------------------------ | ----------------------------------------------- |
| [Frontend Handover](./docs/handover.md)                | Current routes, integrations, operations, risks |
| [Architecture Overview](./docs/architecture.md)        | System architecture and data flow               |
| [Project Structure](./docs/project-structure.md)       | Directory structure explanation                 |
| [Components](./docs/components.md)                     | UI and shared components guide                  |
| [Modules](./docs/modules.md)                           | Feature modules documentation                   |
| [Hooks](./docs/hooks.md)                               | Custom React hooks reference                    |
| [Services](./docs/services.md)                         | Commerce and CMS service boundaries             |
| [Business Flows](./docs/business-flows.md)             | Historical checkout, payout, trading overview   |
| [Market Orders](./docs/market-orders-core-business.md) | Trading domain and implementation status        |
| [Resources](./docs/resources.md)                       | Payload CMS runtime and content setup           |
| [Styling Guide](./docs/styling.md)                     | Tailwind CSS and design tokens                  |
| [Testing](./docs/testing.md)                           | Testing setup and patterns                      |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

<!-- ready to run -->
