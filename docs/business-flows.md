# Business Flows

This document describes the key business flows in the Cask Exchange platform.
It includes historical examples and should not be used as the current API
contract. For active code paths, start with [Frontend handover](./handover.md),
the checkout route under `src/app/(site)/(checkout)`, and
`src/modules/market-orders`. The commerce backend owns final state transitions.

## Table of Contents

- [Buy Flow](#buy-flow)
- [Make Offer Flow](#make-offer-flow)
- [Sell Flow](#sell-flow)
- [Checkout Flow](#checkout-flow)
- [Payout Flow](#payout-flow)

---

## Buy Flow

The Buy Flow allows users to purchase casks at the listed price (lowest ask).

### Flow Steps

```
Browse Marketplace → Select Cask → View Details → Click "Buy Now" → Confirm → Checkout
```

### Detailed Flow

1. **Browse Marketplace** (`/marketplace`)
    - User browses casks with filters (category, region, price, vintage, etc.)
    - Casks displayed in grid with floor price, 30D trend, cask type
    - "Buy Now" button visible on cards with active listings

2. **View Cask Detail** (`/marketplace/[id]`)
    - Shows full cask information, market data, price history
    - Sidebar shows "Buy Now" panel with:
        - Current lowest ask price
        - Market data (highest bid, volume)
        - "Buy Now" button

3. **Initiate Buy**
    - User clicks "Buy Now" button
    - System validates:
        - User is authenticated
        - User has completed KYC verification
        - Cask is still available
    - Creates checkout session

4. **Checkout Process**
    - Redirects to `/checkout/[sessionId]`
    - Multi-step process: Deposit → Agreement → Invoice → Transfer

### Code Flow

```
User clicks "Buy Now"
    ↓
CaskDetailPage → handleBuyNow()
    ↓
checkoutService.createSession({ caskMasterId, type: 'buy_now' })
    ↓
router.push(`/checkout/${sessionId}`)
    ↓
CheckoutFlow (Deposit → Agreement → Invoice → Transfer)
```

### Key Files

| File                                      | Purpose               |
| ----------------------------------------- | --------------------- |
| `src/modules/cask-master-detail/sidebar/` | Buy Now sidebar panel |
| `src/modules/checkout/`                   | Checkout flow         |
| `src/services/checkout.ts`                | Checkout API calls    |

---

## Make Offer Flow

The Make Offer Flow allows users to submit offers below the listed price.

### Flow Steps

```
View Cask → Click "Make Offer" → Enter Amount → Confirm → Submit Bid → Wait for Acceptance
```

### Detailed Flow

1. **View Cask Detail**
    - User views cask with active listings
    - "Make Offer" button visible in sidebar

2. **Place Bid** (`PlaceBid` component)
    - User enters offer amount
    - System validates:
        - Amount is reasonable (not too low)
        - User has sufficient funds
        - User is authenticated and verified

3. **Confirm Bid** (`ConfirmBid` component)
    - Shows bid summary:
        - Offer amount
        - Current highest bid
        - Current lowest ask
    - User confirms the bid

4. **Submit Bid**
    - Bid submitted to backend
    - Notification sent to seller
    - Bid appears in user's "Buying > Bids" section

5. **Wait for Acceptance**
    - Seller can accept/reject/counter
    - User notified of status changes
    - If accepted, proceeds to checkout

### Code Flow

```
User clicks "Make Offer"
    ↓
PlaceBid component opens
    ↓
User enters amount → validates
    ↓
ConfirmBid component shows summary
    ↓
User confirms → bidService.createBid({ caskMasterId, amount })
    ↓
Bid stored → notification sent to seller
    ↓
Wait for seller response
```

### Key Files

| File                                                    | Purpose          |
| ------------------------------------------------------- | ---------------- |
| `src/modules/cask-master-detail/sidebar/PlaceBid.tsx`   | Bid amount input |
| `src/modules/cask-master-detail/sidebar/ConfirmBid.tsx` | Bid confirmation |
| `src/services/bid.ts`                                   | Bid API calls    |
| `src/modules/mange-cask/buying/bids/`                   | Manage bids      |

---

## Sell Flow

The Sell Flow allows users to list their casks for sale.

### Flow Steps

```
Go to Selling → Select Cask → Set Price → Confirm → Create Ask → Listed
```

### Detailed Flow

1. **Navigate to Selling** (`/selling/asks`)
    - User views their casks eligible for sale
    - "Create Ask" button available

2. **Create Ask** (`CreateAskDialog`)
    - User selects cask to sell
    - Sets asking price
    - Can set optional fields:
        - Minimum acceptable price
        - Expiration date
        - Notes

3. **Confirm Listing**
    - Review listing details
    - Confirm the ask

4. **Ask Created**
    - Cask listed on marketplace
    - Appears in user's "Selling > Asks" section
    - Visible to buyers in marketplace

5. **Manage Asks**
    - User can view all active asks
    - Can update price
    - Can cancel ask
    - Can view offers received

### Code Flow

```
User clicks "Create Ask"
    ↓
CreateAskDialog opens
    ↓
User selects cask + sets price
    ↓
Confirm listing → askService.createAsk({ caskMasterId, price })
    ↓
Ask created → listed on marketplace
    ↓
Appears in "Selling > Asks" list
```

### Key Files

| File                                        | Purpose             |
| ------------------------------------------- | ------------------- |
| `src/modules/mange-cask/selling/asks/`      | Manage selling asks |
| `src/modules/mange-cask/components/dialog/` | Create ask dialog   |
| `src/services/ask.ts`                       | Ask API calls       |

---

## Checkout Flow

The Checkout Flow handles the purchase process from initiation to completion.

### Flow Steps

```
Initiate → Pay Deposit → Sign Agreement → Pay Invoice → Ownership Transfer → Complete
```

### Detailed Flow

1. **Initiate Checkout**
    - Created when buyer clicks "Buy Now" or offer is accepted
    - Checkout session created with:
        - Cask details
        - Price
        - Buyer/Seller info

2. **Pay Deposit** (`/checkout/[id]/deposit`)
    - Initial deposit payment (typically 10-20%)
    - Stripe payment processing
    - Deposit held in escrow

3. **Sign Agreement** (`/checkout/[id]/agreement`)
    - Purchase agreement document
    - DocuSign integration
    - Both parties sign

4. **Pay Invoice** (`/checkout/[id]/invoice`)
    - Remaining balance payment
    - Full amount due
    - Stripe payment processing

5. **Ownership Transfer** (`/checkout/[id]/transfer`)
    - Ownership transferred to buyer
    - Documents updated
    - Notification sent to both parties

6. **Complete** (`/checkout/[id]/complete`)
    - Transaction complete
    - Cask appears in buyer's portfolio
    - Payout initiated for seller

### Key Files

| File                          | Purpose                  |
| ----------------------------- | ------------------------ |
| `src/modules/checkout/`       | Checkout flow components |
| `src/layouts/CheckoutLayout/` | Checkout layout          |
| `src/services/checkout.ts`    | Checkout API calls       |

---

## Payout Flow

The Payout Flow handles seller payouts after successful sale.

### Flow Steps

```
Sale Complete → Sign Release Form → Transaction Processing → Payout Complete
```

### Detailed Flow

1. **Sale Complete**
    - Buyer completes all checkout steps
    - Ownership transferred

2. **Sign Release Form** (`/payout/[id]/sign-release-form`)
    - Seller signs release form
    - Confirms receipt of payment
    - DocuSign integration

3. **Transaction Processing** (`/payout/[id]/transaction-processing`)
    - Payment being processed
    - Stripe Connect payout initiated
    - Status tracking available

4. **Payout Complete** (`/payout/[id]/transaction-completed`)
    - Funds received by seller
    - Transaction history updated
    - Notification sent

### Key Files

| File                        | Purpose                |
| --------------------------- | ---------------------- |
| `src/modules/payout/`       | Payout flow components |
| `src/modules/payout/pages/` | Payout page components |
| `src/services/payout.ts`    | Payout API calls       |

---

## State Transitions

### Cask Status Flow

```
Available → Listed (Ask Created) → Under Offer → Sold → Transferred
    ↓           ↓                    ↓           ↓
  Draft      Cancelled           Rejected    Completed
```

### Order Status Flow

```
Created → Deposit Paid → Agreement Signed → Invoice Paid → Transfer Complete
    ↓           ↓              ↓                ↓              ↓
  Cancelled  Expired        Cancelled         Failed        Completed
```

### Bid Status Flow

```
Created → Pending → Accepted → Checkout Started
    ↓         ↓        ↓
  Cancelled Rejected  Expired
```

---

## Integration Points

### Stripe Connect

All payment flows use Stripe Connect for secure multi-party payments:

```typescript
// Create connected account for seller
stripeService.createAccount({ sellerId, email, country });

// Process payment
stripeService.createPaymentIntent({ amount, currency, connectedAccount });

// Transfer funds to seller
stripeService.createTransfer({ amount, destination });
```

### DocuSign

Agreement signing uses DocuSign integration:

```typescript
// Create signing session
docusignService.createSession({ templateId, recipients });

// Check signing status
docusignService.getStatus(envelopeId);
```

---

## Error Handling

| Error Type       | Handling                          |
| ---------------- | --------------------------------- |
| Payment failed   | Retry option + toast notification |
| Network error    | Toast notification + retry        |
| Validation error | Form-level error messages         |
| Session expired  | Redirect to login                 |
| Bid rejected     | Notification + status update      |
| Ask expired      | Notification + auto-cancel        |
