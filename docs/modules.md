# Modules

Feature modules are self-contained units that encapsulate related functionality.

## Module Structure

```
module-name/
├── index.tsx           # Main module component
├── components/         # Module-specific components
├── provider.tsx        # Context provider (if needed)
├── constants.ts        # Module constants
├── mock-data.ts        # Mock data for development
└── types.ts            # Module-specific types
```

## Key Modules

### cask-listing

Marketplace listing with filters, search, and pagination.

**Location:** `src/modules/cask-listing/`

**Components:**

- `FilterForm` - Sidebar filter form
- `CaskList` - Card grid with pagination
- `ActionHeader` - Search, toggles, sort
- `MarketplaceProvider` - Sidebar collapse state

### distillery-detail

Distillery detail page with tabs.

**Location:** `src/modules/distillery-detail/`

**Components:**

- `DistillerySidebar` - Image, info, description
- `DistilleryTabs` - Portfolio/Market Activity tabs
- `DistilleryStatsRow` - Statistics display
- `DistilleryCaskGrid` - Cask card grid
- `MarketActivityTab` - Market activity table
- `RelatedDistilleriesGrid` - Related distilleries

### notification-inbox

Notification inbox with categories.

**Location:** `src/modules/notification-inbox/`

**Components:**

- `NotificationSidebar` - Category tabs
- `NotificationHeader` - Title, actions
- `NotificationList` - Notification items
- `NotificationItem` - Single notification

### search-results

Search results page.

**Location:** `src/modules/search-results/`

**Components:**

- `SearchResultsHeader` - Tabs with counts
- `SearchActionBar` - Search, toggles, sort
- `SearchResultsGrid` - Results grid

### account

Account settings management.

**Location:** `src/modules/account/`

**Components:**

- `PublicDetailsCard` - Public information
- `PersonalDetailsCard` - Personal information
- `BusinessTypeCard` - Business information
- `ManagementOwnershipCard` - Team members

### security

Security settings with 2FA.

**Location:** `src/modules/security/`

**Components:**

- `PasswordForm` - Change password
- `TwoFaForm` - 2FA management
- `SessionSection` - Active sessions

### resources

CMS-backed Resources pages exposed at `/resources`.

**Location:** `src/modules/resources/`

The module contains the shared cards, rich-text renderer, server-driven search,
and the client component used by Payload Live Preview. Payload collection and
global definitions live separately under `src/payload/`; Resources routes are
under `src/app/(site)`, and server-only reads use
`src/payload/services/ResourceService.ts`.

### market-orders

Shared listing and offer definitions, order editor, matching calculations,
buy/sell submit hooks, and management overlays. This is the current shared
trading boundary used by cask detail and profile/manage-cask screens. See
`src/modules/market-orders/` and [Market Orders Core Business](./market-orders-core-business.md).

### checkoutv2

Current `/checkout/[sessionId]` UI: seller confirmation, deposit, agreement,
invoice, and ownership transfer. The route group is
`src/app/(site)/(checkout)`; server and browser API calls live in separate
services. Check [Frontend handover](./handover.md) before working in the older
`_checkout` and `checkout` directories.
