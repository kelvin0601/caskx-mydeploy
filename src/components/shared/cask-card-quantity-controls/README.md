# Cask Card Quantity Controls Components

This component has been refactored to be reusable for both bid and ask operations.

## Components

### 1. QuantityControls

Common component for price and quantity input.

**Props:**

- `price: number` - Current price
- `onPriceChange: (price: number) => void` - Callback when price changes
- `onPriceValidate?: (price: number, cb?: (message: string) => void) => void` - Price validation callback
- `errorMessage?: string | null` - Error message
- `priceLabel?: string` - Label for price input (default: "Or Name Your Bid")
- `pricePlaceholder?: string` - Placeholder for price input (default: "Enter bid")
- `showQuantity?: boolean` - Whether to show quantity input (default: true)
- `className?: string` - Custom CSS class

**Usage:**

```tsx
import { QuantityControls } from "./cask-card-quantity-controls";

<QuantityControls
    price={price}
    onPriceChange={handlePriceChange}
    onPriceValidate={validatePrice}
    errorMessage={error}
    priceLabel="Or Name Your Ask"
    pricePlaceholder="Enter ask"
/>;
```

### 2. CaskHeader

Component to display cask information and "View Market Data" button.

**Props:**

- `data: cask.TCask | null` - Cask data
- `price: number` - Price to display
- `priceLabel: string` - Label for price (e.g., "Lowest ask", "Highest bid")
- `onViewMarketData?: () => void` - Custom callback for "View Market Data" button
- `className?: string` - Custom CSS class

**Usage:**

```tsx
import { CaskHeader } from "./cask-card-quantity-controls";

<CaskHeader data={caskData} price={lowestAsk} priceLabel="Lowest ask" />;
```

### 3. SuggestionCards

Component to display price suggestions.

**Props:**

- `suggestions: TSuggestionItem[]` - List of suggestions
- `selectedId: string | null` - ID of selected suggestion
- `onSelect: (item: TSuggestionItem) => void` - Callback when suggestion is selected
- `isLoading?: boolean` - Loading state
- `title?: string` - Title (default: "Suggested Bids (Per cask)")
- `className?: string` - Custom CSS class

**Usage:**

```tsx
import { SuggestionCards } from "./cask-card-quantity-controls";

<SuggestionCards
    suggestions={suggestions}
    selectedId={selectedId}
    onSelect={handleSuggestionSelect}
    isLoading={isLoading}
    title="Suggested Asks (Per cask)"
/>;
```

### 4. BidControls

Complete component for bid operations.

**Props:**

- `data: cask.TCask | null` - Cask data
- `priceBid: number` - Bid price
- `onValidatePrice?: (price: number, cb?: (message: string) => void) => void` - Price validation callback
- `className?: string` - Custom CSS class

**Usage:**

```tsx
import { BidControls } from "./cask-card-quantity-controls";

<BidControls
    data={caskData}
    priceBid={bidPrice}
    onValidatePrice={validateBidPrice}
/>;
```

### 5. AskControls

Complete component for ask operations.

**Props:**

- `data: cask.TCask | null` - Cask data
- `onValidatePrice?: (price: number, cb?: (message: string) => void) => void` - Price validation callback
- `className?: string` - Custom CSS class

**Usage:**

```tsx
import { AskControls } from "./cask-card-quantity-controls";

<AskControls data={caskData} onValidatePrice={validateAskPrice} />;
```

## Types

### TSuggestionItem

```tsx
type TSuggestionItem = {
    id: string;
    label: string;
    price: number;
};
```

## Migration Guide

### From old component to new components:

**Before:**

```tsx
import CaskCardQuantityControls from "./cask-card-quantity-controls";

<CaskCardQuantityControls
    data={caskData}
    priceBid={bidPrice}
    type="bid"
    onValidatePrice={validatePrice}
/>;
```

**After (for Bid):**

```tsx
import { BidControls } from "./cask-card-quantity-controls";

<BidControls
    data={caskData}
    priceBid={bidPrice}
    onValidatePrice={validatePrice}
/>;
```

**After (for Ask):**

```tsx
import { AskControls } from "./cask-card-quantity-controls";

<AskControls data={caskData} onValidatePrice={validatePrice} />;
```

## Benefits

1. **Reusability**: Child components can be used independently
2. **Maintainability**: Each component has a single responsibility
3. **Flexibility**: Each part can be customized as needed
4. **Backward compatibility**: Old component still works normally
5. **Type safety**: Full TypeScript types for all props
