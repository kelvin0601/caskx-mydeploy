# Market Orders Core Business Specification

## 1. Purpose

This document is the as-built specification for the frontend Market Orders
bounded context located at:

```text
src/modules/market-orders/
```

It explains:

- Which business behavior belongs to Market Orders.
- How Listing and Offer are normalized.
- How Buy Now, Sell Now, Place Bid, and Place Ask share one active flow.
- How Update, Cancel, and Duplicate existing orders share one management flow.
- How adapters isolate Ask/Bid API differences.
- How matching, calculations, query keys, submit outcomes, drawers, and host
  navigation work together.
- Which parts are complete and which parts are scaffolding.

This document describes the current implementation. The migration history and
restructure phases remain in
[`profile-market-order-restructure.md`](./profile-market-order-restructure.md).

## 2. Ubiquitous Language

The frontend uses neutral product terms even though backend services still use
Ask/Bid terminology.

| Product term | Backend term | Side | Execution | Meaning                                        |
| ------------ | ------------ | ---- | --------- | ---------------------------------------------- |
| Listing      | Ask          | Sell | Limit     | Sell casks at a user-defined minimum price.    |
| Offer        | Bid          | Buy  | Limit     | Buy casks at a user-defined maximum price.     |
| Sell Now     | Ask matching | Sell | Market    | Match the best available offers immediately.   |
| Buy Now      | Bid matching | Buy  | Market    | Match the best available listings immediately. |

The four active intents form one matrix:

|      | Market execution | Limit order               |
| ---- | ---------------- | ------------------------- |
| Buy  | Buy Now          | Place Bid / Make Offer    |
| Sell | Sell Now         | Place Ask / List For Sale |

Code must use the domain constants instead of duplicating these values as raw
strings:

```ts
MARKET_ORDER_KIND.LISTING;
MARKET_ORDER_KIND.OFFER;

MARKET_ORDER_INTENT.BUY_NOW;
MARKET_ORDER_INTENT.SELL_NOW;
MARKET_ORDER_INTENT.PLACE_BID;
MARKET_ORDER_INTENT.PLACE_ASK;
```

## 3. Bounded Context

### 3.1 Owned by `market-orders`

- Domain constants and normalized types.
- Listing and Offer definitions.
- Editor and command adapters.
- Shape-safe query-key factory.
- Controlled order draft fields.
- Active trading intent and edit/confirm transitions.
- Buy-side and sell-side matching classification.
- Bid and Ask price calculations.
- Buy Now and Sell Now submit orchestration.
- Normalized submit outcomes.
- Shared Order Editor and order-specific controls.
- Existing-order Update, Cancel, and Duplicate overlay selection.
- Update drawer and Cancel alert behavior.
- Duplicate drawer shell and command contract.

### 3.2 Not owned by `market-orders`

- App Router routes and page metadata.
- Cask Detail drawer verification and presentation mapping.
- Authentication, KYC, Stripe readiness, or permission decisions.
- Checkout and payout page navigation.
- Screen-specific toast copy after normalized outcomes.
- Profile and Manage Cask tables, tabs, search, sorting, and pagination.
- Backend API contracts and Axios configuration.
- Generic Drawer primitives and the shared responsive Drawer frame.

### 3.3 Dependency direction

```text
App routes
    -> screen modules
        -> market-orders
            -> services + domain types + constants
```

Allowed consumers:

```text
cask-master-detail
profile/offer
profile/listing (when implemented)
mange-cask/buying
mange-cask/selling
```

`market-orders` must never import a component, provider, or hook from one of
those consumers.

## 4. Directory Structure

```text
src/modules/market-orders/
├── constants.ts
├── index.ts
├── query-keys.ts
├── types.ts
├── adapters/
│   ├── listing-order-adapter.ts
│   └── offer-order-adapter.ts
├── definitions/
│   ├── listing-definition.ts
│   └── offer-definition.ts
├── flow/
│   ├── definitions.ts
│   ├── reducer.ts
│   ├── types.ts
│   └── provider/
├── flows/
│   ├── buy-now/
│   └── sell-now/
├── hooks/
│   ├── use-buy-order-matching.ts
│   ├── use-sell-order-matching.ts
│   └── use-order-calculation.ts
├── management/
│   ├── context.ts
│   ├── provider/
│   └── overlay-group/
└── components/
    ├── order-editor/
    ├── quantity-selector/
    ├── expiration-select/
    ├── fulfillment-preference/
    ├── pending-order-section/
    ├── matching-orders/
    ├── order-filled-content/
    ├── update-order-drawer/
    ├── update-offer-confirmation/
    ├── cancel-order-alert/
    └── duplicate-order-drawer/
```

Generic drawer layout is outside the bounded context:

```text
src/components/shared/drawer-wrapper/
```

## 5. Domain Constants and Types

### 5.1 Runtime constants

`constants.ts` defines runtime-safe `as const` objects:

| Constant               | Values                                                           |
| ---------------------- | ---------------------------------------------------------------- |
| `MARKET_ORDER_KIND`    | `listing`, `offer`                                               |
| `MARKET_ORDER_INTENT`  | `buy-now`, `sell-now`, `place-bid`, `place-ask`                  |
| `MARKET_ORDER_STEP`    | `edit`, `confirm`                                                |
| `MARKET_ORDER_OUTCOME` | `checkout`, `payout`, `open-order`, `completed`, `price-changed` |
| `MARKET_ORDER_OVERLAY` | `update`, `cancel`, `duplicate`                                  |

Types are derived from these constants. Do not declare a second union with the
same string values.

Reducer-only action discriminators remain local unions because they are not
shared runtime identifiers.

### 5.2 `OrderDraft`

```ts
type OrderDraft = {
    price: number;
    quantity: number;
    expirationDays: string;
    executionPolicy: EBidExecutionPolicy;
};
```

Invariants:

- `price` is normalized to a number before reaching service adapters.
- `quantity` has a minimum of `1` in editor UI.
- Update flows must cap `quantity` at the order's `remainingQuantity`.
- `expirationDays` is a UI string because the Select component uses string
  values. Command adapters convert it to a number at the API boundary.
- `executionPolicy` uses the existing backend enum
  `EBidExecutionPolicy`.

### 5.3 Normalized editor types

- `OrderSuggestion` hides raw Ask/Bid suggestion field names.
- `OrderCaskSummary` is the minimum cask data required by the editor.
- `PriceValidationResult` normalizes validation to `none`, `warning`, or
  `error`.
- `MarketOrderLabels` contains Listing/Offer presentation differences.
- `MarketOrderDefinition` owns price extraction and market-reference rules.

Shared components must consume these normalized types. They must not branch on
raw response fields such as `conservativeAsk`, `goodBid`, `askPrice`, or
`bidPrice`.

## 6. Listing and Offer Definitions

Definitions contain static semantic differences, not network behavior.

### 6.1 Listing definition

- Kind: `listing`.
- Initial price: `askPrice`, then generic `price`.
- Market reference: highest Bid / Top Offer.
- Update copy: Update Listing.
- Cancel copy: remove the Listing from the marketplace.

Market price fallback order:

```text
marketData.highestBid
    -> order.cask.highestBid
    -> order.master.highestBid
    -> fallback price
```

### 6.2 Offer definition

- Kind: `offer`.
- Initial price: `bidPrice`, then generic `price`.
- Market reference: lowest Ask / Floor Price.
- Update copy: Update Offer.
- Cancel copy: remove the Offer from the marketplace.

Market price fallback order:

```text
marketData.lowestAsk
    -> order.cask.lowestAsk
    -> order.master.lowestAsk
    -> fallback price
```

Definitions must remain pure and testable. Do not put React Query, navigation,
toast, or service mutations in them.

## 7. Adapter Contracts

Adapters are anti-corruption layers between neutral frontend behavior and the
Ask/Bid backend APIs.

### 7.1 Editor adapter

```ts
type MarketOrderEditorAdapter = {
    definition: MarketOrderDefinition;
    getSuggestions(caskId): Promise<OrderSuggestion[]>;
    getMarketData(caskId): Promise<TCaskBidMarketData>;
    validatePrice(caskId, price): Promise<PriceValidationResult>;
};
```

Responsibilities:

- Call the correct Ask/Bid service.
- Convert raw suggestions into a common array.
- Remove invalid, non-finite, or zero-price suggestions.
- Normalize validation responses.
- Expose the correct definition.

### 7.2 Command adapter

```ts
type MarketOrderCommandAdapter = {
    editor: MarketOrderEditorAdapter;
    listQueryKey: readonly unknown[];
    create(input: CreateOrderInput): Promise<unknown>;
    update(input: UpdateOrderInput): Promise<unknown>;
    cancel(orderId: string): Promise<unknown>;
    duplicate(input: CreateOrderInput): Promise<unknown>;
};
```

Responsibilities:

- Convert `OrderDraft` to the correct Ask/Bid payload.
- Convert `expirationDays` to a number.
- Map neutral `price` to `askPrice` or `bidPrice`.
- Supply the stable list key used after mutations.
- Keep components free from Ask/Bid conditional branches.

### 7.3 Listing adapter mapping

| Neutral operation | Service operation                     |
| ----------------- | ------------------------------------- |
| Suggestions       | `caskAskService.getAskSuggestions`    |
| Validation        | `caskAskService.validateAskPrice`     |
| Market data       | `caskBidService.getCaskBidMarketData` |
| Create            | `caskAskService.createAsk`            |
| Update            | `caskAskService.updateAsk`            |
| Cancel            | `caskAskService.cancelAsk`            |
| Duplicate         | `caskAskService.createAsk`            |

### 7.4 Offer adapter mapping

| Neutral operation | Service operation                     |
| ----------------- | ------------------------------------- |
| Suggestions       | `caskBidService.getCaskBidSuggestion` |
| Validation        | `caskBidService.validatePriceBid`     |
| Market data       | `caskBidService.getCaskBidMarketData` |
| Create            | `caskBidService.createCaskBids`       |
| Update            | `caskBidService.updateBid`            |
| Cancel            | `caskBidService.cancelBid`            |
| Duplicate         | `caskBidService.createCaskBids`       |

Duplicate commands reuse the same backend Create endpoints through the
explicit `adapter.duplicate` contract. The controlled Duplicate confirmation
footer invokes that command rather than Update.

## 8. Query-Key Factory

All Market Order queries and mutations use `MARKET_ORDER_KEYS` and existing
constants from `KEY_ASK`, `KEY_BID`, and `KEY_TRADING`.

| Factory                                 | Required response inputs      |
| --------------------------------------- | ----------------------------- |
| `root()` / `root`                       | Market Orders domain          |
| `suggestions(kind, caskId)`             | Order kind and cask           |
| `marketData(caskId)`                    | Cask                          |
| `buyMatching(caskId, price, quantity)`  | Cask, maximum price, quantity |
| `sellMatching(caskId, price, quantity)` | Cask, minimum price, quantity |
| `buyCalculation(data)`                  | Full calculation request      |
| `sellCalculation(data)`                 | Full calculation request      |
| `validation(kind, caskId)`              | Order kind and cask           |
| `create(kind)`                          | Order kind                    |
| `update(kind, orderId)`                 | Order kind and order          |
| `cancel(kind, orderId)`                 | Order kind and order          |

Rules:

1. Every parameter that changes a response must be present in the key.
2. Listing and Offer suggestions must never share a key.
3. Different response shapes must never share a key.
4. Conditional queries must use `enabled`.
5. Mutations invalidate the narrowest stable owner key.
6. Feature components must not duplicate query-key arrays.

## 9. Active Trading Flow

The active trading flow is mounted in Cask Detail through
`MarketOrderFlowProvider`.

### 9.1 State

```ts
type MarketOrderFlowState = {
    intent: MarketOrderIntent | null;
    step: MarketOrderStep;
    draft: OrderDraft;
    placeRemainingOrder: boolean;
};
```

Default draft:

```text
price: 0
quantity: 1
expirationDays: "30"
executionPolicy: PARTIAL_ALLOWED
```

### 9.2 State and action contexts

State and actions use separate contexts:

```text
MarketOrderFlowActionsContext
    -> MarketOrderFlowStateContext
        -> consumer screens
```

This prevents components that only dispatch navigation actions from receiving
the draft through the same context value.

### 9.3 Reducer transitions

```text
idle
  -- startFlow(intent) --> edit(intent, default draft)

edit
  -- goToConfirm() --> confirm
  -- switchFlow(intent) --> edit(new intent, same draft)
  -- closeFlow() --> idle/default state

confirm
  -- backToEdit() --> edit(same intent, same draft)
  -- switchFlow(intent) --> edit(new intent, same draft)
  -- closeFlow() --> idle/default state
```

Action semantics:

| Action                          | Behavior                                                             |
| ------------------------------- | -------------------------------------------------------------------- |
| `startFlow(intent)`             | Resets the complete flow, then starts the intent.                    |
| `switchFlow(intent)`            | Preserves draft, returns to Edit, resets remaining-order preference. |
| `goToConfirm()`                 | Keeps intent and draft, changes step to Confirm.                     |
| `backToEdit()`                  | Keeps intent and draft, changes step to Edit.                        |
| `setDraft(draft)`               | Replaces the complete controlled draft.                              |
| `updateDraft(partial)`          | Immutably merges selected fields.                                    |
| `setPlaceRemainingOrder(value)` | Controls whether unmatched quantity remains open.                    |
| `closeFlow()`                   | Resets intent, step, draft, and remaining-order preference.          |

### 9.4 Cask Detail presentation adapter

Cask Detail maps business state to existing drawer tabs:

```text
(buy-now, edit)       -> BUY_NOW
(buy-now, confirm)    -> CONFIRM_BUY_NOW
(place-bid, edit)     -> PLACE_BID
(place-bid, confirm)  -> CONFIRM_BID
(sell-now, edit)      -> SELL_NOW
(sell-now, confirm)   -> CONFIRM_SELL_NOW
(place-ask, edit)     -> PLACE_ASK
(place-ask, confirm)  -> CONFIRM_ASK
```

`CaskDetailProvider` owns drawer presentation, loading aggregation, and
verification dialogs. It does not own Market Order draft fields.

The compatibility methods `setSidebarCurrent` and `setDrawerOpen` translate
old presentation calls into Market Order flow actions; they must not introduce
a second source of business state.

## 10. Matching Classification

Matching hooks translate backend fulfillment summaries into stable frontend
scenarios.

### 10.1 Buy-side matching

Input:

```text
caskId + maximumPrice + quantity
```

Meaning: find Listings that can fulfill a Buy Now or Offer request.

### 10.2 Sell-side matching

Input:

```text
caskId + minimumPrice + quantity
```

Meaning: find Offers that can fulfill a Sell Now or Listing request.

### 10.3 Normalized scenarios

| Scenario    | Rule                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| Full        | Backend can fulfill the requested quantity.                            |
| Partial     | Full fulfillment is false and fulfilled quantity is greater than zero. |
| Unfulfilled | Full fulfillment is false and fulfilled quantity is zero.              |

Hooks expose both canonical names and temporary compatibility aliases used by
existing confirmation screens. New code should prefer:

```text
isFullyFulfilled
isPartiallyFulfilled
isUnfulfilled
```

Queries remain disabled until cask, price, and quantity are valid.

## 11. Price Calculation

`useOrderCalculation` owns price-breakdown queries for both sides:

- `bidCalQuery` calls Bid calculation for Buy-side flows.
- `askCalQuery` calls Ask calculation for Sell-side flows.
- `refetchBid(data)` performs a fresh calculation after a changed market price.
- `refetchAsk(data)` performs a fresh Ask calculation when required.

Rules:

- Calculation query keys include the complete request object.
- Queries are disabled until required payload fields exist.
- Previous calculation data is retained during compatible refetches.
- Calculation hooks do not navigate or submit orders.

## 12. Buy Now Submit Orchestration

`useSubmitBuyNow` returns a normalized outcome instead of navigating directly.

Decision flow:

```text
submit
  -> fetch current lowest Ask
  -> no fulfilled quantity?
       -> create Offer
       -> OPEN_ORDER
  -> displayed price changed?
       -> invalidate market/current price
       -> PRICE_CHANGED
  -> execute Buy Now
  -> fetch Bid transaction
  -> checkout session missing?
       -> throw error
  -> CHECKOUT(sessionId)
```

Partial quantity rule:

- Partial match and `placeRemainingOrder = false`: execute only the fulfilled
  quantity.
- Otherwise: submit the full draft quantity and let the backend response own
  remainder behavior.

Host responsibilities after outcome:

- `OPEN_ORDER`: show Offer-created success and close the flow.
- `PRICE_CHANGED`: update draft price, recalculate, and keep confirmation open.
- `CHECKOUT`: close the flow and navigate to Checkout.

## 13. Sell Now Submit Orchestration

`useSubmitSellNow` also returns a normalized outcome.

Decision flow:

```text
submit
  -> unfulfilled?
       -> create Listing with sellNow flag
       -> OPEN_ORDER
  -> matching state unresolved?
       -> throw error
  -> fetch current highest Bid
  -> displayed price changed?
       -> PRICE_CHANGED
  -> execute Sell Now
  -> matched with payout/remainder order id?
       -> PAYOUT
  -> zero matched quantity?
       -> OPEN_ORDER
  -> COMPLETED
```

Host responsibilities after outcome:

- `OPEN_ORDER`: show Listing-created success and close the flow.
- `PRICE_CHANGED`: update the draft, refresh detail data, and keep confirmation
  open.
- `PAYOUT`: navigate to the payout workflow.
- `COMPLETED`: show completion feedback and close the flow.

Submit hooks must not call `router.push`, render toast copy, or manipulate
Cask Detail drawer tabs.

## 14. Normalized Submit Outcomes

```ts
type MarketOrderSubmitOutcome =
    | { type: "checkout"; sessionId: string }
    | { type: "payout"; payoutId: string; hasRemainingOrder?: boolean }
    | { type: "open-order"; orderId?: string }
    | { type: "completed" }
    | { type: "price-changed"; price: number };
```

Outcome consumers must use `MARKET_ORDER_OUTCOME` constants and exhaustive
branching where practical.

An outcome is a business result, not UI state. Navigation and toast copy remain
with the host screen.

## 15. Shared Order Editor

`OrderEditor` is controlled:

```tsx
<OrderEditor
    adapter={adapter.editor}
    cask={caskSummary}
    value={draft}
    onChange={setDraft}
    maxQuantity={remainingQuantity}
    enabled={isOpen}
    onValidationChange={setValidation}
/>
```

It owns:

- Cask summary presentation.
- Market-reference query and display.
- Suggestion query, loading skeleton, selection, and error feedback.
- Custom price input parsing and formatting.
- Throttled price validation.
- Quantity selector integration.
- Expiration selector integration.
- Responsive editor layout.

It does not own:

- The canonical draft state.
- Edit/Confirm transitions.
- Create, Update, Cancel, or Duplicate submission.
- Checkout or payout navigation.
- Provider overlay selection.
- Authentication or trading guards.

Validation rules:

- Price less than or equal to zero is an error.
- Backend `error` blocks submission.
- Backend `warning` is displayed but does not automatically block submission.
- Validation request failure becomes a warning so the user receives feedback
  without a false client-side authorization decision.

## 16. Shared Order Controls

### Quantity Selector

- Minimum defaults to `1`.
- Optional maximum clamps Update quantity.
- Increment/decrement buttons expose accessible names.
- Increment is disabled at maximum.
- Typed values are clamped before being published.

### Expiration Select

- Controlled by `expirationDays`.
- Uses shared `EXPIRATION_OPTIONS`.
- Publishes string values to match Select behavior.
- Accepts an accessible label.

### Fulfillment Preference

- Uses `EBidExecutionPolicy`.
- Displays full-at-once and partial-allowed scenarios.
- Adapts Listing/Offer copy through `MarketOrderKind`.

### Pending Order Section

- Summarizes unmatched Listing or Offer quantity.
- Allows expiration and execution-policy changes for the remaining order.
- Is reused by partial Buy Now and Sell Now confirmation scenarios.

## 17. Existing-Order Management Flow

Existing-order management is independent from the active trading flow.

It is mounted by Profile Offer and Manage Cask screens through
`MarketOrderManagementProvider`.

### 17.1 State

```ts
type MarketOrderManagementContextValue = {
    adapter: MarketOrderManagementAdapter;
    selectedOrder: TTableRow | null;
    activeOverlay: "update" | "cancel" | "duplicate" | null;
    openUpdate(order, kind): void;
    openCancel(order, kind): void;
    openDuplicate(order, kind): void;
    closeOverlay(): void;
};
```

Management state is transient client UI state. It must not be persisted in
Zustand or populated with server-response copies.

### 17.2 Transition model

```text
idle
  -- openUpdate(row) --> update(row)
  -- openCancel(row) --> cancel(row)
  -- openDuplicate(row) --> duplicate(row)

update | cancel | duplicate
  -- open another action(row) --> new action(row)
  -- closeOverlay() --> idle
```

Only one management action can be active at a time.

### 17.3 Provider responsibilities

- Store the selected row.
- Store the active overlay discriminator.
- Expose stable action callbacks.
- Provide the screen-specific Listing or Offer management adapter.
- Mount the overlay group once.

The provider does not contain mutation logic and does not import leaf overlay
implementations.

### 17.4 Overlay group

`MarketOrderManagementOverlayGroup` is the presentation registry. Update and
Duplicate each use an explicit edit and confirm entry:

```text
update           -> UpdateOrderBody + UpdateOrderFooter
confirm-update   -> UpdateOrderBody + UpdateOrderFooter
duplicate        -> controlled Listing/Offer editor
confirm-duplicate -> controlled Listing/Offer confirmation
cancel           -> CancelOrderAlert
```

Only the active overlay component is mounted.

When `activeOverlay` becomes `null`, the group retains the last rendered
overlay for `500ms`. The leaf receives `open = false`, allowing the Drawer or
Alert exit animation to finish before unmounting. This mirrors Cask Detail's
separation between open state and last rendered drawer content.

Adding another management action requires:

1. Add a constant to `MARKET_ORDER_OVERLAY`.
2. Extend the context action contract.
3. Add one explicit overlay component.
4. Register the component in the overlay group.
5. Add adapter commands only if the action needs them.

Do not add another sibling component directly inside the provider.

## 18. Update Existing Order

Update behavior is implemented for both Listing and Offer. Offer Update has a
local confirmation step because changing an Offer can immediately match active
Listings. Listing Update remains a direct submission from the editor until its
confirmation rules are defined.

Open flow:

```text
table action
  -> openUpdate(row)
  -> overlay group selects UpdateOrderDrawer
  -> local draft initialized from selected row
```

Offer transition:

```text
edit
  -- Continue --> GET matching-bids with caskId + price + quantity
      -- failure --> edit + error feedback
      -- success --> confirm
confirm
  -- Back --> edit
  -- Update Offer --> adapter.update(draft)
```

The matching query is disabled while editing. `Continue` explicitly calls
`refetch()` so opening the drawer and changing fields do not produce speculative
matching requests. The query still uses `MARKET_ORDER_KEYS.buyMatching`, so the
request is deduplicated and cached under the same core-business key as Place
Bid and Buy Now.

`UpdateOfferConfirmation` is an explicit Offer variant. It composes the shared
Cask summary, `MatchingOrders`, `FulfillmentPreferenceSection`, and
`OrderFilledContent`. When the matching result can execute immediately, it also
uses the shared Buy calculation query to present the payment estimate. Do not
add Offer confirmation flags to `OrderEditor`; the drawer owns the transition
and selects the appropriate content.

Draft initialization:

- Price comes from the active definition.
- Quantity starts from `remainingQuantity`, with minimum `1`.
- Expiration is derived with `getExpirationDays(createdAt, expirationDate)`;
  it is never hardcoded to 30 days.
- Execution policy comes from the selected row, falling back to
  `PARTIAL_ALLOWED`.

Execution policy is retained for presentation but excluded from the Update
dirty check and the Update API payload. Update only sends price, remaining
quantity, and expiration days.

Submission guard:

- Selected order id exists.
- Cask id exists.
- Price is greater than zero.
- Quantity is greater than zero.
- Validation warning type is not `error`.
- Mutation is not already pending.
- Offer matching check is not already fetching.

Success behavior:

1. Show success feedback.
2. Close the Update overlay.
3. Invalidate the adapter's list key.
4. Invalidate market data for the affected cask.
5. If an Offer update returns a Checkout session after an immediate match,
   navigate to the deposit payment route.

Failure behavior:

- Keep the drawer open.
- Resolve a user-facing error with `getErrorMessage`.
- Preserve the local draft for retry.

The Update Offer `edit -> confirm` state remains local to
`UpdateOrderDrawer`. It reuses `MARKET_ORDER_STEP` identifiers but is not stored
in the active Buy/Sell flow provider or the management provider. Closing or
opening another order always resets it to `edit`.

## 19. Cancel Existing Order

Cancel behavior is implemented for Listing and Offer.

Matched quantity is derived from the selected row:

```text
matchedQuantity = max(0, quantity - remainingQuantity)
```

Scenarios:

| Scenario          | Copy behavior                                                           |
| ----------------- | ----------------------------------------------------------------------- |
| Unmatched         | Use definition-specific cancel title and description.                   |
| Partially matched | Explain that matched casks proceed and only the remainder is cancelled. |

Submission behavior:

- Prevent duplicate clicks while pending.
- Call `adapter.cancel(selectedOrder.id)`.
- Close after success.
- Invalidate only the adapter's list key.
- Remain open after failure.

## 20. Duplicate Existing Order

Duplicate is implemented as a create flow for both Listing and Offer:

```text
duplicate edit
  -- Continue --> confirm-duplicate
confirm-duplicate
  -- Back --> duplicate edit
  -- Confirm --> adapter.duplicate(draft)
```

- The draft price comes from the active Listing/Offer definition.
- Quantity starts from the original total quantity, rather than the remaining
  Update quantity.
- Expiration is derived from the original creation and expiration timestamps.
- The edit step reuses the controlled `LimitOrderEditor` used by Place Ask and
  Place Bid, including suggestions, validation, quantity, and expiration.
- The confirm step selects an explicit Listing or Offer confirmation component.
- Success/error feedback, checkout or payout routing, and narrow cache
  invalidation reuse the corresponding create-flow footer.

Duplicate always creates a new order and never calls `adapter.update`.

## 21. Shared Drawer Composition

`src/components/shared/drawer-wrapper` owns generic presentation:

- Responsive 16/12/4-column layout.
- Accessible Drawer title and description.
- Header and optional header-aside slot.
- Body ScrollArea.
- Content height and opacity transition keyed by `contentKey`.
- Separators.
- Footer slot.
- Header/footer loading skeletons.

Feature components own:

- Drawer root `open` state.
- Business title and description.
- Body content.
- Footer actions.
- Mutation pending state.
- `contentKey` representing the current screen or selected order.

Market Orders and Cask Detail both compose this wrapper. The generic component
must not import either provider.

## 22. Consumer Integration

### 22.1 Cask Detail

Provider order:

```tsx
<MarketOrderFlowProvider>
    <CaskDetailProvider>{/* detail screen */}</CaskDetailProvider>
</MarketOrderFlowProvider>
```

Cask Detail:

- Starts intents after trading guards pass.
- Maps intent/step to drawer presentation.
- Provides cask data to editor screens.
- Handles normalized outcomes with router and toast behavior.
- Resets payment-specific Checkout state when the detail lifecycle requires
  it, but does not store Market Order draft fields there.

### 22.2 Profile Offer

```tsx
<MarketOrderManagementProvider adapter={offerOrderAdapter}>
    <ProfileOfferContent />
</MarketOrderManagementProvider>
```

Row actions call:

```text
openUpdate(row)
openCancel(row)
openDuplicate(row)
```

Table filters, statuses, sorting, pagination, and responsive cards remain in
Profile Offer.

### 22.3 Manage Cask Buying

- Mounts the management provider with `offerOrderAdapter`.
- Update and Cancel use the common management flow.
- View Cask and View Transactions remain in Manage Cask.
- Duplicate entry point is not implemented yet.

### 22.4 Manage Cask Selling

- Mounts the management provider with `listingOrderAdapter`.
- Update and Cancel use the common management flow.
- Payout, release form, document, and transaction actions remain in Manage
  Cask.
- Duplicate entry point is not implemented yet.

## 23. Loading, Error, and Conditional States

### Queries

- Suggestions and market data run only when the editor is enabled and has a
  cask id.
- Matching runs only when cask, price, and quantity are valid.
- Calculation runs only when its required request fields exist.
- Skeletons preserve editor and drawer layout.

### Mutations

- Pending state disables the owning action.
- Mutation errors keep the current drawer or alert open.
- User-facing errors use `getErrorMessage` with a meaningful fallback.
- Price-change outcomes keep Confirm open and refresh the draft instead of
  submitting against a stale displayed price.

### Guards

Authentication, verification, permissions, and Stripe readiness are host
responsibilities. A host must not call `startFlow` until its asynchronous guard
state has resolved.

## 24. Import and Ownership Rules

Use public exports when practical:

```ts
import {
    MARKET_ORDER_INTENT,
    MarketOrderFlowProvider,
    MarketOrderManagementProvider,
    offerOrderAdapter,
} from "@/modules/market-orders";
```

Rules:

1. Components never call Axios directly.
2. Components use adapters or domain hooks for Market Order services.
3. API paths remain in shared constants/services.
4. Generic UI primitives remain in `components/ui`.
5. Generic composed UI remains in `components/shared`.
6. Order-specific UI remains in `market-orders/components`.
7. Screen-private table logic remains with Profile or Manage Cask.
8. Do not import from `_cask-detail` or `_sidebar`.
9. Do not add Market Order draft fields back to Checkout or Cask Detail state.
10. Do not add a consumer dependency inside `market-orders`.

## 25. Extension Recipes

### Add a new Listing/Offer editor capability

1. Extend the normalized editor type.
2. Implement both adapters or explicitly make the capability optional.
3. Update `OrderEditor` using normalized data only.
4. Add parameters to query keys if they change a response.
5. Add unit and component tests for both kinds.

### Add a new active intent

1. Add a runtime intent constant.
2. Extend `MARKET_ORDER_INTENTS` with side and execution.
3. Define reducer semantics if existing transitions are insufficient.
4. Add Cask Detail presentation mapping.
5. Add edit and confirm screens.
6. Return normalized outcomes from core submit logic.
7. Add transition and outcome tests.

### Add a management overlay

1. Add the overlay constant.
2. Add a context action.
3. Add the leaf overlay component.
4. Register it in the overlay group.
5. Preserve the exit-animation window.
6. Wire eligible consumer actions.
7. Add adapter commands and invalidation only when required.

### Complete Duplicate

1. Confirm Figma and product rules for initial quantity and price.
2. Define a local controlled draft.
3. Reuse `OrderEditor` only if Duplicate shares Update/Create editor rules.
4. Invoke `adapter.duplicate`, never `adapter.update`.
5. Add a dedicated mutation key if Duplicate requires independent tracking.
6. Invalidate the adapter list and affected market data after success.
7. Add Profile and Manage Cask integration tests.

## 26. Anti-Patterns

Do not:

- Add `if (kind === "listing")` service calls inside shared components.
- Store the same draft in Checkout, Cask Detail, and Market Order providers.
- Mount each management overlay directly as a sibling in the provider.
- Reuse one query key for Ask and Bid response shapes.
- Navigate inside a reusable submit hook.
- Put Profile or Manage Cask table filters in the business module.
- Use raw overlay, intent, kind, step, or outcome strings outside constant
  definitions.
- Treat Duplicate as Update; Duplicate creates a new order.
- Modify legacy `_` implementations to mirror active behavior.

## 27. Test Strategy

### Pure unit tests

- Runtime constant values.
- Intent side/execution matrix.
- Reducer transitions and reset behavior.
- Listing/Offer market-reference extraction.
- Query-key separation and parameter coverage.
- Suggestion and validation normalization.
- Matching scenario classification.
- Submit outcome decision tables.

### Component tests

- Order Editor loading, suggestion, validation warning, validation error, and
  bounded quantity behavior.
- Update drawer initialization, valid submission, error retention, and narrow
  invalidation.
- Cancel alert unmatched and partial-match copy.
- Overlay group Update/Cancel/Duplicate switching and delayed unmount.
- Duplicate shell open and close behavior.

### Integration tests

- Place Bid edit to confirm to open Offer or Checkout.
- Place Ask edit to confirm to open Listing or Payout.
- Buy Now and Sell Now price-change recovery.
- Partial match with and without a remaining order.
- Profile Offer Update, Cancel, and eventually Duplicate.
- Manage Buying and Selling Update/Cancel.

## 28. Validation Commands

```bash
npx prettier --check src/modules/market-orders docs/market-orders-core-business.md
npx eslint src/modules/market-orders
npx tsc --noEmit --pretty false
npm test -- --runInBand
git diff --check
```

Use `npm run build:prod` when a provider boundary, App Router boundary, or
client/server component boundary changes.

## 29. Current Completion Status

### Complete

- Listing and Offer definitions and adapters.
- Constant-backed query keys.
- Controlled shared Order Editor.
- Quantity, expiration, fulfillment, and pending-order controls.
- Unified active trading provider and reducer.
- Buy-side and sell-side matching hooks.
- Buy/Sell calculation hook.
- Buy Now and Sell Now normalized submit orchestration.
- Cask Detail active-flow integration.
- Existing-order management provider, context, and overlay registry.
- Update Listing/Offer.
- Update Offer matching check and confirmation step.
- Cancel Listing/Offer.
- Profile Offer and Manage Cask Update/Cancel integration.

### Scaffolded

- Duplicate Listing/Offer adapter command.
- Duplicate management state and overlay registry entry.
- Profile Offer Duplicate entry point.
- Duplicate drawer shell.

### Remaining QA or follow-up

- Detailed Duplicate product and Figma behavior.
- Browser-level visual regression for drawers on desktop, tablet, and mobile.
- End-to-end Checkout and payout redirects against backend environments.
- Dedicated removal of legacy `_` modules and compatibility wrappers.
- Optional `mange-cask` to `manage-cask` directory rename.

## 30. Definition of Done for New Market Order Work

New Market Order behavior is complete only when:

- Ownership follows this bounded-context document.
- Domain constants and normalized types are used.
- Query keys include all response-changing parameters.
- Loading, success, empty, error, and pending states are handled.
- Matching and price-change scenarios are covered.
- Partial quantity and remaining-order behavior are explicit.
- Update/Cancel/Duplicate actions invalidate only their owner queries.
- Host navigation remains outside reusable business hooks.
- Desktop, tablet, mobile, keyboard, focus, and dialog behavior are verified.
- Targeted Prettier and ESLint pass.
- TypeScript, tests, and `git diff --check` pass.
