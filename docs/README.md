# Cask Exchange - Documentation

Welcome to the Cask Exchange documentation. This directory contains comprehensive documentation for the codebase.

Start with [Frontend handover](./handover.md) for the current source map,
environment, deployment paths, and open risks. The domain specifications and
older flow examples below provide context; confirm behavior against source and
the commerce backend before using them as operational instructions.

## Table of Contents

- [Architecture Overview](./architecture.md) - System architecture and data flow
- [Frontend Handover](./handover.md) - Current source map, runtime flows, operations, and risks
- [Project Structure](./project-structure.md) - Directory structure explanation
- [Components](./components.md) - UI and shared components guide
- [Modules](./modules.md) - Feature modules documentation
- [Hooks](./hooks.md) - Custom React hooks reference
- [Services](./services.md) - Commerce and CMS service boundaries
- [Business Flows](./business-flows.md) - Historical flow overview; verify current API behavior
- [Market Orders Core Business](./market-orders-core-business.md) - Trading domain and implementation status
- [Resources](./resources.md) - Payload CMS runtime and content setup
- [Styling Guide](./styling.md) - Tailwind CSS and design tokens
- [Testing](./testing.md) - Testing setup and patterns
- [Resources Payload CMS Plan](./resources-payload-cms-plan.md) - Resources
  content model and migration plan

## Quick Start

```bash
# Install dependencies
npm ci --legacy-peer-deps

# Run development server
npm run dev

# Check a changed source file without autofix
npx eslint path/to/file.tsx

# Check types
npx tsc --noEmit --pretty false
```

## Tech Stack

| Layer                | Technology                   |
| -------------------- | ---------------------------- |
| **Framework**        | Next.js 15 with App Router   |
| **Language**         | TypeScript                   |
| **Styling**          | Tailwind CSS                 |
| **State Management** | Zustand, Context API         |
| **Data Fetching**    | TanStack Query, Axios        |
| **Forms**            | React Hook Form + Zod        |
| **UI Components**    | Radix UI + shadcn/ui         |
| **Testing**          | Jest + React Testing Library |
| **Payments**         | Stripe Connect               |
| **CMS**              | Payload CMS + PostgreSQL     |

## Project Overview

Cask Exchange is a marketplace for trading whisky casks. The application includes:

- **Marketplace** - Browse and search casks with filters
- **Distillery Pages** - View distillery details and casks
- **Account Management** - User profile, security, notifications
- **Checkout** - Multi-step purchase flow with Stripe
- **Payout** - Seller payout management
- **Profile** - View offers and listings
- **Admin** - Internal management tools
- **Resources CMS** - Payload-managed guides, topics, FAQs, and media

## Key Directories

```
src/
├── app/(site)/   # Commerce web routes
├── app/(payload)/ # Payload Admin and CMS routes
├── components/   # Shared UI components
├── modules/      # Feature modules
├── payload/      # CMS collections, access, migrations, services
├── layouts/      # Layout components
├── hooks/        # Custom React hooks
├── services/     # API service layer
├── store/        # Zustand state stores
├── lib/          # Utilities and constants
└── types/        # TypeScript type definitions
```

## Getting Help

- Check the [Architecture Overview](./architecture.md) for system design
- Review [Components](./components.md) for UI component usage
- See [Modules](./modules.md) for feature-specific documentation
- Refer to [Frontend Handover](./handover.md) for active checkout/payout paths
- See [Testing](./testing.md) for test patterns
