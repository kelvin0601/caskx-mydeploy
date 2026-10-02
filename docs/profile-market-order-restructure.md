# Market Orders Frontend Restructure

> For the current core-business contracts, state machines, ownership rules,
> and extension guidance, see
> [`market-orders-core-business.md`](./market-orders-core-business.md).

## 1. Purpose

This document defines the complete frontend restructuring plan for Listing and
Offer business flows shared by:

- Cask Master Detail.
- Profile Offer.
- A future Profile Listing screen.
- Manage Cask Buying.
- Manage Cask Selling.

The restructuring must remove duplicated order-editing behavior without
merging unrelated screen workflows.

The target result is a neutral `market-orders` business module that owns shared
Listing/Offer definitions, editor behavior, query keys, reusable controls, and
Update/Cancel overlays.

This work must be implemented on a dedicated branch and split into reviewable
commits. Do not combine it with unrelated UI, API contract, or repository-wide
formatting changes.

## 2. Confirmed Active and Legacy Code

### Active source of truth

Only the following Cask Detail implementation is active and should be used as
the reference:

```text
src/modules/cask-master-detail/
src/modules/cask-master-detail/sidebar/
```

The active Marketplace route imports:

```text
src/app/(root)/marketplace/[id]/page.tsx
    -> src/modules/cask-master-detail/index.tsx
```

Relevant active files include:

```text
src/modules/cask-master-detail/provider/index.tsx
src/modules/cask-master-detail/sidebar/PlaceAsk.tsx
src/modules/cask-master-detail/sidebar/PlaceBid.tsx
src/modules/cask-master-detail/sidebar/ConfirmAsk.tsx
src/modules/cask-master-detail/sidebar/ConfirmBid.tsx
src/modules/cask-master-detail/sidebar/WrapperDrawer.tsx
src/modules/cask-master-detail/sidebar/components/
```

### Legacy code

Directories or files prefixed with `_` are old versions and are not used:

```text
src/modules/_cask-detail/
src/modules/cask-master-detail/_sidebar/
```

Rules for legacy code:

- Do not refactor it.
- Do not copy behavior from it.
- Do not keep it synchronized with the active implementation.
- Do not include it in targeted tests for this migration.
- Do not delete it in the same functional PR.
- Keep compatibility re-exports at old non-underscored paths when TypeScript
  still compiles a legacy import.
- Remove it only in a dedicated legacy-cleanup PR after confirming it has no
  consumers.

## 3. Existing Frontend Architecture

The repository uses a hybrid architecture:

- Feature-first modules in `src/modules`.
- Next.js App Router composition in `src/app`.
- Shared horizontal layers for API services, domain types, constants, stores,
  and reusable hooks.

```text
src/
├── app/                 # Routes and server composition
├── modules/             # Feature and business modules
├── components/ui/       # shadcn/Radix primitives
├── components/shared/   # Cross-product components
├── hooks/               # Hooks shared by independent features
├── services/            # API access
├── store/               # Global Zustand state
├── types/               # Shared domain/API types
└── lib/                 # Constants and utilities
```

The restructure must follow this architecture instead of introducing a new
repository-wide pattern.

## 4. Current Problems

### 4.1 Duplicate order editor UI

The following behavior is repeated between `PlaceAsk`, `PlaceBid`, and the
Update Listing/Offer drawer:

- Cask summary.
- Market reference price.
- Quantity control.
- Suggested prices.
- Suggestion selection.
- Custom price input.
- Price formatting.
- Price validation feedback.
- Expiration selection.
- Ask/Bid labels and copy.

### 4.2 Incorrect component ownership

The Profile update flow currently imports these components from Cask Detail:

```text
@/modules/cask-master-detail/sidebar/components/quantity-selector
@/modules/cask-master-detail/sidebar/components/offer-expiration-select
```

These controls are not Cask Detail-specific. They belong to the shared Market
Orders domain.

### 4.3 Feature-to-feature dependency

Manage Cask must not import a provider or business component owned by Profile.
Profile and Manage Cask are sibling consumers of marketplace order behavior.

### 4.4 Ask/Bid query-key collision risk

The active `PlaceAsk` requests Ask suggestions using a Bid suggestion query
key. Ask and Bid suggestions have different response shapes, so sharing a key
can return invalid cached data.

Every Listing and Offer query must use a distinct, response-shape-safe key.

### 4.5 Market price naming mismatch

The Listing editor displays “Top Offer”, but the active `PlaceAsk` derives a
variable named `lowestAsk` from `marketData.lowestAsk`.

During migration, verify the intended contract:

- Listing should display the current highest Bid/top offer.
- Offer should display the current lowest Ask/floor price.

Do not preserve an incorrect field solely to match current implementation.

### 4.6 Quantity is not bounded

The current Quantity Selector supports a minimum but no maximum. Update flows
must not allow a quantity greater than `remainingQuantity`. Create flows should
respect the available quantity returned by the active Cask Detail contract.

### 4.7 Feature-private hooks are globally located

These hooks are tied to one screen but currently live in `src/hooks`:

```text
useProfileOfferTable.tsx
useManageBuyingTable.tsx
useManageSellingTable.tsx
```

They should be colocated with their owning features after the business module
has been migrated.

### 4.8 Buy/Sell/Ask/Bid flow state is fragmented

The four active trading intents form one business matrix:

| Side | Market execution | Limit order |
| ---- | ---------------- | ----------- |
| Buy  | Buy Now          | Place Bid   |
| Sell | Sell Now         | Place Ask   |

They all follow `edit -> matching -> confirm -> submit -> outcome`, but their
draft is split between the root `CheckoutProvider` and `CaskDetailProvider`.
Expiration and execution policy are duplicated, and business navigation is
encoded as Cask Detail drawer tabs. A Market Order flow must become the single
owner of intent, step, draft, and remaining-order preference.

## 5. Architecture Decision

Create a neutral business module:

```text
src/modules/market-orders/
```

Do not use the narrower name `market-order-actions`. The bounded context owns
Buy Now, Sell Now, Place Bid, Place Ask, and management of existing Listing and
Offer orders.

The flow is modeled by two independent axes rather than four unrelated
implementations:

```text
side:      buy | sell
execution: market | limit
```

Update/Cancel overlays have a separate lifecycle and provider from the active
Buy/Sell/Ask/Bid flow.

Consumer relationship:

```text
cask-master-detail ─────┐
profile/offer ──────────┤
profile/listing ────────┼──> market-orders
manage-cask/buying ─────┤
manage-cask/selling ────┘
```

`market-orders` must not import components or providers from any consumer.

## 6. Target Structure

```text
src/
├── app/
│   └── (root)/
│       ├── marketplace/[id]/page.tsx
│       └── profile/
│           ├── offer/page.tsx
│           └── listing/page.tsx              # Only when route is required
│
├── components/
│   └── shared/
│       └── drawer-wrapper/                    # Shared responsive drawer frame
│
├── modules/
│   ├── market-orders/
│   │   ├── index.ts
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── query-keys.ts
│   │   ├── flow/
│   │   │   ├── types.ts
│   │   │   ├── definitions.ts
│   │   │   ├── reducer.ts
│   │   │   └── provider/
│   │   ├── flows/
│   │   │   ├── buy-now/
│   │   │   ├── sell-now/
│   │   │   ├── place-bid/
│   │   │   └── place-ask/
│   │   ├── definitions/
│   │   │   ├── listing-definition.ts
│   │   │   └── offer-definition.ts
│   │   ├── adapters/
│   │   │   ├── listing-order-adapter.ts
│   │   │   └── offer-order-adapter.ts
│   │   ├── hooks/
│   │   │   ├── use-order-editor.ts
│   │   │   ├── use-buy-order-matching.ts
│   │   │   ├── use-sell-order-matching.ts
│   │   │   └── use-order-calculation.ts
│   │   ├── components/
│   │   │   ├── order-editor/
│   │   │   ├── quantity-selector/
│   │   │   ├── expiration-select/
│   │   │   ├── update-order-drawer/
│   │   │   ├── cancel-order-alert/
│   │   │   └── duplicate-order-drawer/       # Shell only until detailed flow
│   │   └── management/
│   │       ├── context.ts
│   │       ├── provider/
│   │       └── overlay-group/
│   │
│   ├── cask-master-detail/
│   │   ├── index.tsx
│   │   ├── provider/
│   │   └── sidebar/
│   │       ├── PlaceAsk.tsx
│   │       ├── PlaceBid.tsx
│   │       ├── ConfirmAsk.tsx
│   │       ├── ConfirmBid.tsx
│   │       └── ...
│   │
│   ├── profile/
│   │   ├── offer/
│   │   │   ├── index.tsx
│   │   │   ├── components/
│   │   │   └── hooks/use-offer-table.tsx
│   │   └── listing/                         # Add screen only when required
│   │
│   └── mange-cask/
│       ├── buying/
│       │   ├── index.tsx
│       │   └── hooks/use-buying-table.tsx
│       └── selling/
│           ├── index.tsx
│           └── hooks/use-selling-table.tsx
│
├── services/
│   ├── cask-ask.ts
│   └── cask-bid.ts
│
└── types/
    ├── cask-ask.d.ts
    ├── cask-bid.d.ts
    └── table.d.ts
```

The existing folder is named `mange-cask`. Renaming it to `manage-cask` is
recommended, but must be handled in a separate commit or PR because it affects
many imports and is unrelated to order behavior.

## 7. Dependency Rules

```text
app routes
    ↓
screen/workflow modules
    ↓
market-orders business module
    ↓
services + shared domain types + constants
    ↓
configured HTTP client
```

Rules:

1. App Router pages import screen entry points from `modules`.
2. Cask Detail, Profile, and Manage Cask may import `market-orders`.
3. `market-orders` must not import Cask Detail, Profile, or Manage Cask.
4. Ask/Bid services stay in `src/services`.
5. Shared backend contracts stay in `src/types`.
6. Generic UI primitives stay in `src/components/ui`.
7. Order-specific controls belong to `market-orders/components`.
8. Feature-private hooks belong to their screen module.
9. Global hooks remain in `src/hooks` only when used by independent features.
10. Do not add Zustand state for Update/Cancel overlay selection.
11. Generic drawer layout, scrolling, transitions, separators, and responsive
    grid structure belong to `components/shared/drawer-wrapper`; feature
    modules provide only title, header aside, body, footer, and loading state.

## 8. Business Boundaries

### Owned by `market-orders`

- Runtime-safe domain constants for kind, intent, step, outcome, and management
  overlay, with TypeScript unions derived from those constants.
- Buy Now, Sell Now, Place Bid, and Place Ask flow definitions.
- Active flow intent, edit/confirm step, controlled draft, and remaining-order
  preference.
- Matching classification and price-calculation hooks.
- Create/execute command adapters and normalized submit outcomes.
- Listing and Offer definitions.
- Normalized labels and copy.
- Shape-safe query keys.
- Suggestion normalization.
- Price validation normalization.
- Market reference price normalization.
- Controlled order editor behavior.
- Quantity and expiration controls.
- Fulfillment preference controls and execution-policy copy.
- Pending Listing/Offer summary sections.
- Update order drawer.
- Cancel order alert.
- Update/Cancel management overlay provider.
- Create, update, and cancel command adapters.

### Retained by `cask-master-detail`

- Drawer navigation and animation lifecycle.
- Mapping Market Order flow state to drawer presentation.
- Payment and payout route navigation from normalized outcomes.
- Cask Detail loading orchestration.
- `CaskDetailProvider`.

### Retained by Profile and Manage Cask

- Listing and Offer table rendering.
- Filters, sorting, pagination, and tabs.
- Row eligibility rules for Update/Cancel actions.
- View details, View Cask, View Transactions, payout, and document actions.
- Screen loading, empty, and error layouts.

## 9. Provider Design

### `CaskDetailProvider`

Keep this provider independent. It owns a multi-step Detail workflow and must
not inherit from the Market Order management provider.

It owns drawer presentation only: open/close animation, current presentation
tab, loading state, and verification-dialog state. It derives the active
Buy/Sell/Ask/Bid drawer tab from `MarketOrderFlowProvider`; it does not own an
order draft, expiration, execution policy, or remaining-order preference.

### `MarketOrderFlowProvider`

This provider is mounted above `CaskDetailProvider`. It owns only active
business-flow client state:

```ts
type MarketOrderFlowState = {
    intent: MarketOrderIntent | null;
    step: MarketOrderStep;
    draft: OrderDraft;
    placeRemainingOrder: boolean;
};
```

State and actions use separate contexts so draft changes do not force consumers
that only dispatch navigation actions to subscribe to the draft.

### `MarketOrderManagementProvider`

This provider is mounted by screens that expose Update, Cancel, and Duplicate
overlays.

```ts
type MarketOrderManagementContextValue = {
    adapter: MarketOrderManagementAdapter;
    selectedOrder: TTableRow | null;
    activeOverlay: MarketOrderOverlay | null;
    openUpdate: (order: TTableRow) => void;
    openCancel: (order: TTableRow) => void;
    openDuplicate: (order: TTableRow) => void;
    closeOverlay: () => void;
};
```

It should:

- Hold only transient selected-row and overlay state.
- Ensure only one management overlay can be active at a time.
- Expose stable callbacks.
- Delegate rendering to `MarketOrderManagementOverlayGroup`, which maps the
  active overlay to exactly one Update drawer, Cancel alert, or Duplicate
  drawer.
- Keep the last rendered overlay mounted during its exit window so closing
  Drawer/Alert animations are not cut off when `activeOverlay` becomes `null`.

It should not:

- Store server responses.
- Copy Cask Detail navigation state.
- Own checkout or payout state.
- Persist state in Zustand.
- Contain Ask/Bid conditional mutations.

Use composition, not provider inheritance.

## 10. Domain Types

Stable values used across providers and consumer modules are defined once as
`as const` objects in `market-orders/constants.ts`. Their types are derived
from the runtime constants instead of duplicating string unions. Native
TypeScript enums are not used here because these values must serialize as API
and UI strings without additional enum runtime output.

Reducer-only action discriminators, side/execution metadata, warning types,
and UI variants remain local unions because they do not need a shared runtime
lookup.

Define normalized types in `market-orders/types.ts`:

```ts
export type MarketOrderKind =
    (typeof MARKET_ORDER_KIND)[keyof typeof MARKET_ORDER_KIND];
export type MarketOrderEditorMode = "create" | "update";

export type OrderSuggestion = {
    id: string;
    label: string;
    price: number;
    badgeVariant?: "default" | "success";
};

export type OrderDraft = {
    price: number;
    quantity: number;
    expirationDays: string;
    executionPolicy: EBidExecutionPolicy;
};

export type OrderCaskSummary = {
    id: string;
    name?: string;
    imageUrl?: string;
    vintageYear?: string | number | null;
    priceReference?: number | string | null;
};

export type PriceValidationResult = {
    message: string;
    warningType: "none" | "warning" | "error";
};

export type UpdateOrderInput = {
    orderId: string;
    caskId: string;
    draft: OrderDraft;
};
```

Do not add fake fields to `TTableRow`. Extend shared types only when the backend
contract actually returns the field.

## 11. Split Adapter Design

Do not create one large adapter that mixes labels, editor queries, commands,
checkout, and navigation.

### Order definition

```ts
export type MarketOrderDefinition = {
    kind: MarketOrderKind;
    labels: {
        updateTitle: string;
        updateNote: string;
        marketPriceLabel: string;
        suggestionSectionLabel: string;
        expirationLabel: string;
        cancelTitle: string;
        cancelDescription: string;
        keepLabel: string;
        cancelLabel: string;
        partialCancelTitle: string;
        partialCancelLabel: string;
        successName: string;
    };
    getInitialPrice: (order: TTableRow) => number;
    getMarketPrice: (
        order: TTableRow,
        marketData?: caskBid.TCaskBidMarketData
    ) => number;
};
```

### Editor adapter

```ts
export type MarketOrderEditorAdapter = {
    definition: MarketOrderDefinition;
    getSuggestions: (caskId: string) => Promise<OrderSuggestion[]>;
    getMarketData: (caskId: string) => Promise<caskBid.TCaskBidMarketData>;
    validatePrice: (
        caskId: string,
        price: number
    ) => Promise<PriceValidationResult>;
};
```

### Command adapter

```ts
export type MarketOrderCommandAdapter = {
    editor: MarketOrderEditorAdapter;
    listQueryKey: readonly unknown[];
    create: (input: { caskId: string; draft: OrderDraft }) => Promise<unknown>;
    update: (input: UpdateOrderInput) => Promise<unknown>;
    cancel: (orderId: string) => Promise<unknown>;
};
```

The adapters normalize API differences:

### Listing

- Suggestions: `conservativeAsk`, `moderateAsk`, `aggressiveAsk`.
- Validation: `caskAskService.validateAskPrice`.
- Create/update/cancel: `caskAskService`.
- Initial price: `askPrice`.
- Market reference: `highestBid`.
- List invalidation: `KEY_ASK.ASK_MY_ASKS`.

### Offer

- Suggestions: `goodBid`, `betterBid`, `buyFaster`.
- Validation: `caskBidService.validatePriceBid`.
- Create/update/cancel: `caskBidService`.
- Initial price: `bidPrice`.
- Market reference: `lowestAsk`.
- List invalidation: `KEY_BID.BID_MY_BIDS`.

Shared components must consume normalized values and must not access raw
Ask/Bid suggestion fields.

## 12. Query-Key Factory

Define domain-owned keys in `market-orders/query-keys.ts`:

```ts
export const MARKET_ORDER_KEYS = {
    root: [KEY_TRADING.MARKET_ORDERS] as const,
    suggestions: (kind: MarketOrderKind, caskId: string) =>
        [KEY_TRADING.MARKET_ORDERS, kind, suggestionConstant, caskId] as const,
    validation: (kind: MarketOrderKind, caskId: string) =>
        [KEY_TRADING.MARKET_ORDERS, kind, validationConstant, caskId] as const,
    marketData: (caskId: string) => [KEY_BID.BID_MARKET_DATA, caskId] as const,
    buyMatching: (caskId: string, price: number, quantity: number) =>
        [KEY_ASK.ASK_MATCHING_BIDS, price, quantity, caskId] as const,
    sellMatching: (caskId: string, price: number, quantity: number) =>
        [KEY_BID.BID_MATCHING_ASKS, price, quantity, caskId] as const,
    create: (kind: MarketOrderKind) =>
        [KEY_TRADING.MARKET_ORDERS, kind, createConstant] as const,
    update: (kind: MarketOrderKind, orderId?: string) =>
        [KEY_TRADING.MARKET_ORDERS, kind, updateConstant, orderId] as const,
    cancel: (kind: MarketOrderKind, orderId?: string) =>
        [KEY_TRADING.MARKET_ORDERS, kind, cancelConstant, orderId] as const,
};
```

The `*Constant` placeholders above are resolved by the factory from `KEY_ASK`
or `KEY_BID`; raw operation strings are not duplicated in feature code.

Rules:

- Listing and Offer suggestions must never share a key.
- Include every parameter that changes a response.
- Enable editor queries only while the relevant UI is active.
- Do not fetch Update drawer data before the drawer opens.
- Reuse the same normalized suggestion key between Cask Detail and Update
  drawer so valid cache data can be shared.
- Do not share a key between different response shapes.
- Keep list invalidation based on existing stable Ask/Bid list keys.

## 13. Shared Order Editor

Create a controlled `OrderEditor` component.

Suggested API:

```tsx
<OrderEditor
    mode="create"
    adapter={listingEditorAdapter}
    cask={caskSummary}
    value={draft}
    maxQuantity={availableQuantity}
    onChange={setDraft}
    onValidationChange={setValidation}
/>
```

Update usage:

```tsx
<OrderEditor
    mode="update"
    adapter={offerEditorAdapter}
    cask={caskSummary}
    value={draft}
    maxQuantity={selectedOrder.remainingQuantity}
    onChange={setDraft}
    onValidationChange={setValidation}
/>
```

The editor owns presentation and normalized editor behavior:

- Cask summary layout.
- Market reference price presentation.
- Suggestion loading and selection.
- Custom price parsing and formatting.
- Throttled/debounced validation.
- Validation warning/error display.
- Quantity selection with minimum and maximum.
- Expiration selection.
- Responsive layout and skeletons.

The editor must not:

- Navigate between Cask Detail steps.
- Submit Create, Update, or Cancel mutations.
- Open checkout or payout routes.
- Read `useCheckout` directly.
- Read `CaskDetailProvider` directly.
- Know whether it is rendered in Profile or Manage Cask.

The parent controls the draft. This allows Cask Detail to keep draft state
across Place and Confirm steps while Update drawer can use local state.

## 14. Shared Controls

Move these active controls from Cask Detail into `market-orders/components`:

```text
cask-master-detail/sidebar/components/quantity-selector.tsx
    -> market-orders/components/quantity-selector/index.tsx

cask-master-detail/sidebar/components/offer-expiration-select.tsx
    -> market-orders/components/expiration-select/index.tsx

cask-master-detail/fulfillment-preference-item/index.tsx
    -> market-orders/components/fulfillment-preference/item.tsx

cask-master-detail/sidebar/components/fulfillment-preference-section.tsx
    -> market-orders/components/fulfillment-preference/section.tsx

cask-master-detail/sidebar/components/pending-offer-section.tsx
    -> market-orders/components/pending-order-section/index.tsx
```

Update all active imports after moving them.

Quantity Selector requirements:

- `minQuantity`, default `1`.
- Optional `maxQuantity`.
- Disable increment when the maximum is reached.
- Clamp typed values to the valid range.
- Add accessible names to icon-only buttons.
- Preserve mobile sizing and focus-visible behavior.

Expiration Select requirements:

- Remain controlled.
- Reuse `EXPIRATION_OPTIONS`.
- Accept a customizable accessible label if needed.
- Preserve current responsive styles.

## 15. Cask Master Detail Integration

### Place Ask

Replace duplicated editor fields with `OrderEditor` configured with the
Listing editor adapter.

Cask Detail remains responsible for:

- Obtaining active cask data.
- Providing available quantity.
- Starting the `place-ask` intent and mapping its step to the drawer.
- Calling `goToConfirm()` on Continue.
- Providing the Sell Now secondary action.

### Place Bid

Replace duplicated editor fields with `OrderEditor` configured with the Offer
editor adapter.

Cask Detail remains responsible for:

- Obtaining active cask data.
- Providing available quantity.
- Starting the `place-bid` intent and mapping its step to the drawer.
- Calling `goToConfirm()` on Continue.
- Providing the Buy Now secondary action.

### Confirm Ask and Confirm Bid

Do not merge these screens into `OrderEditor`.

They keep their screen-specific fee, checkout, payout, toast, and redirect
presentation. Matching, calculation, create/execute commands, and normalized
submit outcomes belong to `market-orders`.

### Checkout state

`MarketOrderFlowProvider` replaces Checkout state as the source of truth for
price, quantity, expiration, execution policy, intent, and step. Checkout may
still own payment-specific state and reset behavior after a flow closes; order
draft fields must not be written back to it.

## 16. Update and Cancel Overlay Integration

### Update drawer

The shared Update drawer:

- Reads selected order and adapter from Context.
- Initializes a local controlled `OrderDraft`.
- Renders the shared `OrderEditor` in `update` mode.
- Sets `maxQuantity` to `remainingQuantity`.
- Blocks submission on invalid price or quantity.
- Calls the command adapter’s `update` method.
- Invalidates the adapter list key and relevant market data.
- Remains open after an error.
- Closes after a successful update.

### Cancel alert

The shared Cancel alert:

- Reads selected order and adapter from Context.
- Calculates matched quantity as `quantity - remainingQuantity`.
- Uses unmatched copy when matched quantity is zero.
- Uses partial-match copy when matched quantity is greater than zero.
- Calls the command adapter’s `cancel` method.
- Prevents duplicate submission while pending.
- Invalidates the adapter list key after success.
- Remains open after an error.

## 17. Profile Integration

Target Profile structure:

```text
src/modules/profile/
├── offer/
│   ├── index.tsx
│   ├── components/
│   └── hooks/use-offer-table.tsx
└── listing/
    └── ...                              # Only when screen is implemented
```

Profile Offer must:

- Mount `MarketOrderManagementProvider` with the Offer management adapter.
- Call `openUpdate(row)`, `openCancel(row)`, and `openDuplicate(row)` from
  eligible row actions.
- Keep filtering, sorting, pagination, tabs, statistics, and mobile cards in
  the Profile Offer feature.

Do not create a fake Profile Listing screen or route merely to complete the
folder structure.

## 18. Manage Cask Integration

### Buying

- Mount the provider with the Offer command adapter.
- Replace legacy Update Bid sidebar writes with `openUpdate(row)`.
- Replace generic Cancel Bid confirmation with `openCancel(row)`.
- Preserve View Cask and View Transactions.
- Remove obsolete checkout writes from the Buying table hook.

### Selling

- Mount the provider with the Listing command adapter.
- Replace legacy Update Ask sidebar writes with `openUpdate(row)`.
- Replace generic Cancel Ask confirmation with `openCancel(row)`.
- Preserve View Cask, payout, release form, and transaction actions.
- Remove obsolete checkout writes from the Selling table hook.

Manage Cask must import from `market-orders`, never from `profile`.

## 19. Hook Placement

Move only feature-private hooks:

```text
Before                                      After
------------------------------------------  -------------------------------------------------
src/hooks/useProfileOfferTable.tsx          src/modules/profile/offer/hooks/use-offer-table.tsx
src/hooks/useManageBuyingTable.tsx          src/modules/mange-cask/buying/hooks/use-buying-table.tsx
src/hooks/useManageSellingTable.tsx         src/modules/mange-cask/selling/hooks/use-selling-table.tsx
```

Keep generic hooks such as debounce and query invalidation in `src/hooks`.
Market-order matching and calculation hooks belong to `market-orders/hooks`.
Temporary global hook files may remain as thin compatibility re-exports for
legacy `_` code, but active consumers must import the domain hooks.

Do not combine hook colocation with the `mange-cask` directory rename.

## 20. File Migration Map

Starting paths may differ by branch. Use the applicable source.

```text
Current/WIP source                                           Target
-----------------------------------------------------------  ----------------------------------------------------------------
src/modules/profile-offer/index.tsx                          src/modules/profile/offer/index.tsx
src/modules/profile-offer/filter-popover/                    src/modules/profile/offer/components/filter-popover/
src/modules/profile-offer/mobile-offer-card.tsx              src/modules/profile/offer/components/mobile-offer-card.tsx
src/modules/profile-offer/pagination/                        src/modules/profile/offer/components/pagination/
src/modules/profile-offer/stats-cards/                       src/modules/profile/offer/components/stats-cards/
src/modules/profile-offer/table-skeleton/                    src/modules/profile/offer/components/table-skeleton/

src/modules/profile-order-actions/provider/                  src/modules/market-orders/management/provider/
src/modules/profile/provider/                                src/modules/market-orders/management/provider/
src/modules/profile-order-actions/update-order-drawer/       src/modules/market-orders/components/update-order-drawer/
src/modules/profile/components/update-order-drawer/          src/modules/market-orders/components/update-order-drawer/
src/modules/profile-order-actions/cancel-order-alert/        src/modules/market-orders/components/cancel-order-alert/
src/modules/profile/components/cancel-order-alert/           src/modules/market-orders/components/cancel-order-alert/

src/modules/cask-master-detail/sidebar/components/
  quantity-selector.tsx                                     src/modules/market-orders/components/quantity-selector/index.tsx
src/modules/cask-master-detail/sidebar/components/
  offer-expiration-select.tsx                               src/modules/market-orders/components/expiration-select/index.tsx
```

Do not include mappings from `_cask-detail` or `_sidebar`; they are legacy.

## 21. Migration Phases

### Phase 0: Baseline verification

1. Confirm the active Marketplace route uses `cask-master-detail`.
2. Confirm no active route imports `_cask-detail` or `_sidebar`.
3. Capture current Listing/Offer behavior for desktop and mobile.
4. Record current API payloads and response types.
5. Run TypeScript and targeted lint before restructuring.

### Phase 1: Create domain types and query keys

1. Create `src/modules/market-orders`.
2. Add normalized types.
3. Add shape-safe query keys.
4. Add Listing and Offer definitions.
5. Do not migrate UI yet.

### Phase 2: Add editor adapters

1. Normalize Listing suggestions.
2. Normalize Offer suggestions.
3. Normalize Ask/Bid validation results.
4. Normalize market reference prices.
5. Add focused tests for normalizers.

### Phase 3: Move shared controls

1. Move Quantity Selector.
2. Add maximum quantity support.
3. Move Expiration Select.
4. Update active imports.
5. Keep legacy `_` implementations unchanged; use a compatibility re-export
   when an old import path is still compiled.

### Phase 4: Build the controlled Order Editor

1. Extract shared editor layout.
2. Add controlled draft props.
3. Integrate editor adapters.
4. Implement validation states.
5. Match existing skeleton and responsive layouts.
6. Verify Listing and Offer variants independently.

### Phase 5: Migrate Cask Detail Place flows

1. Replace Place Ask duplicated UI with Listing Order Editor.
2. Replace Place Bid duplicated UI with Offer Order Editor.
3. Preserve Place-to-Confirm navigation.
4. Preserve draft state across steps.
5. Preserve Sell Now and Buy Now alternatives.
6. Fix suggestion query-key separation.
7. Verify top offer and floor price fields.

### Phase 6: Add command adapters and overlays

1. Add typed Create/Update/Cancel command adapters.
2. Add the management provider.
3. Implement Update drawer using Order Editor.
4. Implement Cancel alert.
5. Add narrow query invalidation.

### Phase 7: Migrate Profile Offer

1. Move Profile Offer into `modules/profile/offer`.
2. Update the App Router import.
3. Mount the provider with Offer adapter.
4. Wire Update and Cancel actions.
5. Verify desktop table and mobile cards.

### Phase 8: Migrate Manage Cask Buying

1. Mount the provider with Offer adapter.
2. Remove legacy Update Bid sidebar orchestration.
3. Remove generic Cancel Bid flow for migrated rows.
4. Preserve transaction behavior.

### Phase 9: Migrate Manage Cask Selling

1. Mount the provider with Listing adapter.
2. Remove legacy Update Ask sidebar orchestration.
3. Remove generic Cancel Ask flow for migrated rows.
4. Preserve payout and transaction behavior.

### Phase 10: Colocate private hooks

1. Move Offer table hook.
2. Move Buying table hook.
3. Move Selling table hook.
4. Update imports without changing behavior.

### Phase 11: Add unified Market Order flow

1. Define intent, side, execution, step, and outcome types.
2. Add a reducer-backed `MarketOrderFlowProvider`.
3. Mount it above Cask Detail.
4. Make it the source of truth for draft and edit/confirm transitions.
5. Retain drawer open/close animation in Cask Detail.

### Phase 12: Migrate Buy/Sell/Ask/Bid core flows

1. Move matching and calculation hooks into `market-orders`.
2. Migrate Place Bid and Place Ask first.
3. Migrate Buy Now and Sell Now.
4. Normalize submit outcomes and leave router transitions in the host.
5. Remove duplicated flow state from Cask Detail and Checkout providers.

### Phase 13: Cleanup

1. Remove duplicate active implementations after all consumers migrate.
2. Remove stale imports and debug logs.
3. Confirm legacy `_` code was not modified.
4. Run full validation.
5. Document any remaining legacy consumer before merge.

## 21.1 Current Implementation Status

Implemented on `refactor/market-orders-architecture`:

- Domain constants for kind, intent, step, outcome, and management overlay.
- Domain types, definitions, command/editor adapters, and constant-backed query
  keys.
- Controlled Order Editor and shared quantity, expiration, fulfillment,
  pending-order, Update drawer, and Cancel alert components.
- Profile Offer relocation to `modules/profile/offer` and feature-hook
  colocation.
- Manage Cask Buying and Selling integration with the shared management
  provider.
- Reducer-backed Market Order flow for Buy Now, Sell Now, Place Bid, and Place
  Ask, mounted above Cask Detail.
- Domain-owned matching and price-calculation hooks.
- Domain-owned Buy Now and Sell Now submit orchestration with normalized
  outcomes.
- Active Cask Detail draft/navigation migration away from Checkout state.
- Compatibility wrappers only where legacy `_` code is still included by the
  TypeScript project.

Remaining follow-up work that should not be mixed into this functional diff:

- Dedicated removal of `_cask-detail`, `_sidebar`, and compatibility wrappers.
- Optional `mange-cask` to `manage-cask` directory rename.
- Broader browser-level visual regression and end-to-end coverage for payment
  and payout redirects.

## 22. Recommended Commit Strategy

1. `refactor: add market order domain types and query keys`
2. `refactor: add listing and offer editor adapters`
3. `refactor: move shared market order controls`
4. `refactor: add reusable market order editor`
5. `refactor: migrate cask detail place order editors`
6. `refactor: add market order command adapters and overlays`
7. `refactor: migrate profile offer order actions`
8. `refactor: migrate manage cask buying actions`
9. `refactor: migrate manage cask selling actions`
10. `refactor: colocate profile and manage cask hooks`
11. `chore: remove active duplicate order components`

Keep legacy deletion and the `mange-cask` rename out of these commits.

## 23. Behavioral Acceptance Criteria

### Create Listing in Cask Detail

- Loads Listing suggestions with a Listing-specific query key.
- Displays highest Bid as Top Offer.
- Validates Ask price.
- Enforces valid quantity bounds.
- Preserves expiration and draft state when continuing.
- Continues to Confirm Ask.
- Preserves matching, payout, and submission behavior.

### Create Offer in Cask Detail

- Loads Offer suggestions with an Offer-specific query key.
- Displays lowest Ask as Floor Price.
- Validates Bid price.
- Enforces valid quantity bounds.
- Preserves expiration and draft state when continuing.
- Continues to Confirm Bid.
- Preserves matching, checkout, and submission behavior.

### Update Listing

- Initializes from `askPrice` and `remainingQuantity`.
- Uses the same Listing editor rules as Create Listing.
- Cannot exceed remaining quantity.
- Updates only the remaining open quantity.
- Invalidates Ask list and relevant market data.
- Remains open and displays an error on failure.

### Update Offer

- Initializes from `bidPrice` and `remainingQuantity`.
- Uses the same Offer editor rules as Create Offer.
- Cannot exceed remaining quantity.
- Updates only the remaining open quantity.
- Invalidates Bid list and relevant market data.
- Remains open and displays an error on failure.

### Cancel Listing

- Shows unmatched copy when no casks are matched.
- Shows remaining-quantity copy when partially matched.
- Calls Ask cancel service.
- Prevents duplicate submission.
- Invalidates Ask list after success.

### Cancel Offer

- Shows unmatched copy when no casks are matched.
- Shows remaining-quantity copy when partially matched.
- Calls Bid cancel service.
- Prevents duplicate submission.
- Invalidates Bid list after success.

### Shared behavior

- Only one Update/Cancel overlay is active at a time.
- Editor queries run only while their consumer is active.
- Listing and Offer suggestion caches never collide.
- Keyboard, focus, labels, and dialog accessibility remain intact.
- Desktop, tablet, and mobile layouts remain usable.
- Manage Cask transaction and payout actions continue to work.

## 24. Testing Strategy

### Unit tests

Test pure adapters and normalizers:

- Ask suggestion response to `OrderSuggestion[]`.
- Bid suggestion response to `OrderSuggestion[]`.
- Ask/Bid validation normalization.
- Listing/Offer initial price extraction.
- Top offer/floor price extraction.
- Quantity clamping.
- Partial-match quantity calculation.

### Component tests

Test:

- Order Editor loading, success, warning, and error states.
- Suggestion selection and custom price reset.
- Minimum and maximum quantity behavior.
- Expiration selection.
- Update drawer success and failure.
- Cancel alert unmatched and partial states.
- Pending mutation button state.

### Integration tests

Test:

- Place Ask to Confirm Ask.
- Place Bid to Confirm Bid.
- Profile Offer Update and Cancel.
- Manage Buying Update and Cancel.
- Manage Selling Update and Cancel.
- Query invalidation after each mutation.

## 25. Validation Commands

Run targeted checks while migrating:

```bash
npx prettier --check src/modules/market-orders
npx prettier --check src/modules/cask-master-detail
npx prettier --check src/modules/profile
npx prettier --check src/modules/mange-cask

npx eslint src/modules/market-orders
npx eslint src/modules/cask-master-detail
npx eslint src/modules/profile
npx eslint src/modules/mange-cask
```

Run repository-level checks:

```bash
npx tsc --noEmit --pretty false
git diff --check
```

Run broader checks when warranted:

```bash
npm test -- --runInBand
npm run build:prod
```

Audit stale dependencies:

```bash
rg "profile-order-actions|profile-listing|profile-offer" src
rg "cask-master-detail/sidebar/components/(quantity-selector|offer-expiration-select)" src
rg "KEY_BID.BID_SUGGESTION" src/modules/cask-master-detail/sidebar/PlaceAsk.tsx
rg "SIDEBAR_TABS.UPDATE_(ASK|BID)" src
rg "useCheckout" src/modules/profile src/modules/mange-cask
```

Confirm active code does not import legacy versions:

```bash
rg "modules/_cask-detail|cask-master-detail/_sidebar" src/app src/modules src/hooks
```

## 26. Risks and Mitigations

### Risk: over-generalized editor

Mitigation: share controlled fields and normalized business behavior only.
Keep screen composition, checkout/payout routing, toast copy, and drawer
presentation in Cask Detail.

### Risk: god adapter

Mitigation: separate definitions, editor adapters, and command adapters.

### Risk: stale query data with the wrong shape

Mitigation: domain key factory includes Listing/Offer kind.

### Risk: invalid Update quantity

Mitigation: add `maxQuantity` and validate again before mutation.

### Risk: breaking Cask Detail navigation

Mitigation: make the flow reducer own business transitions and keep an explicit
mapping from flow intent/step to the existing drawer presentation tabs.

### Risk: modifying legacy code accidentally

Mitigation: exclude `_cask-detail` and `_sidebar` from changes and targeted
formatting. Preserve old imports with thin compatibility re-exports when the
TypeScript project still compiles those files.

### Risk: large unreviewable diff

Mitigation: follow the commit phases and do not combine directory renames.

## 27. Out of Scope

- Refactoring or deleting `_cask-detail`.
- Refactoring or deleting `cask-master-detail/_sidebar`.
- Payment, payout, authentication, and verification redesign.
- Backend API contract changes.
- Removing checkout-only state from `CheckoutProvider`.
- Adding a Profile Listing route without a product requirement.
- Renaming `mange-cask` in the functional migration.
- Repository-wide formatting or autofix.

## 28. Definition of Done

The restructure is complete when:

- `market-orders` owns the unified Buy/Sell/Ask/Bid flow and shared
  Listing/Offer management behavior.
- One flow draft survives edit-to-confirm transitions without using global
  Checkout state.
- Buy Now, Sell Now, Place Bid, and Place Ask use explicit intent definitions.
- Active Place Ask and Place Bid use the shared controlled Order Editor.
- Cask Detail Confirm, matching, checkout, and payout workflows still work.
- Profile and Manage Cask use shared Update and Cancel overlays.
- Manage Cask no longer imports business behavior from Profile.
- Quantity and expiration controls no longer belong to Cask Detail.
- Fulfillment preference and pending-order controls no longer belong to Cask
  Detail.
- Listing and Offer use separate response-shape-safe suggestion keys.
- Listing displays the correct top offer and Offer displays the correct floor
  price.
- Shared components contain no direct Ask/Bid response-shape branching.
- Feature-private table hooks are colocated with their owners.
- Active duplicate editor and overlay implementations are removed.
- Legacy `_` directories remain untouched.
- Loading, success, error, unmatched, partial-match, and responsive states are
  verified.
- Prettier, ESLint, TypeScript, tests, and `git diff --check` pass for the
  affected scope.
- The final diff contains no unrelated user changes.
