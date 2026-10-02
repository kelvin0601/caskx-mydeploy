# Styling Guide

## Tailwind CSS Configuration

The project uses Tailwind CSS with custom design tokens.

### Breakpoints

| Prefix        | Size          | Description              |
| ------------- | ------------- | ------------------------ |
| `mb`          | max 767px     | Mobile                   |
| `tb`          | max 991px     | Tablet (includes mobile) |
| `j-tb`        | 768px - 991px | Just tablet              |
| `dk`          | min 992px     | Desktop                  |
| `xl-desktop`  | min 1200px    | Large desktop            |
| `2xl-desktop` | min 1400px    | Extra large desktop      |

### Color Tokens

#### Text Colors

```css
text-typo-primary    /* #1b0d03 - Main text */
text-typo-body       /* Body text */
text-typo-sub        /* Subdued text */
text-typo-soft       /* Soft text (50% opacity) */
text-typo-note       /* Note text (40% opacity) */
text-typo-disable    /* Disabled text */
```

#### Background Colors

```css
bg-bg-main           /* Main background */
bg-bg-sf1            /* Surface 1 */
bg-bg-sf2            /* Surface 2 */
bg-bg-sf3            /* Surface 3 */
bg-bg-sf4            /* Surface 4 */
```

#### Border Colors

```css
border-bd-main       /* Main border */
border-bd-brown      /* Brown border */
```

### Font Families

```css
font-reckless        /* Headings */
font-inter           /* Body text */
font-workSans        /* Alternative body */
font-coda            /* Special text */
```

### Spacing System

The project uses a consistent spacing system:

- `gap-1` = 4px
- `gap-2` = 8px
- `gap-3` = 12px
- `gap-4` = 16px
- `gap-6` = 24px
- `gap-8` = 32px

### Component Patterns

#### Card Pattern

```tsx
<div className="border border-bd-main bg-bg-sf1 p-6">{/* Card content */}</div>
```

#### Section Pattern

```tsx
<section className="border-b border-bd-main py-6">
    {/* Section content */}
</section>
```

#### Grid Pattern

```tsx
<div className="grid grid-cols-16 gap-4">{/* Grid items */}</div>
```
