# Components

## UI Components (`src/components/ui/`)

Base UI components built with Radix UI primitives and styled with Tailwind CSS.

### Core Components

| Component | File            | Description                            |
| --------- | --------------- | -------------------------------------- |
| Button    | `button.tsx`    | Multi-variant button component         |
| Input     | `input.tsx`     | Text input with validation states      |
| Select    | `select.tsx`    | Dropdown select component              |
| Switch    | `switch.tsx`    | Toggle switch component                |
| Checkbox  | `checkbox.tsx`  | Checkbox component                     |
| Badge     | `badge.tsx`     | Status badge component                 |
| Dialog    | `dialog.tsx`    | Modal dialog component                 |
| Sheet     | `sheet.tsx`     | Slide-out panel                        |
| Tabs      | `tabs.tsx`      | Tab navigation with animated indicator |
| Accordion | `accordion.tsx` | Collapsible content sections           |
| Tooltip   | `tooltip.tsx`   | Hover tooltip                          |
| Popover   | `popover.tsx`   | Click popover                          |

### Usage Example

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function MyForm() {
    return (
        <div>
            <Input placeholder="Enter text..." />
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">Option 1</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="primary">Submit</Button>
        </div>
    );
}
```

## Shared Components (`src/components/shared/`)

Business-specific reusable components.

### Key Components

| Component        | File                 | Description             |
| ---------------- | -------------------- | ----------------------- |
| CaskCard         | `cask-card/`         | Marketplace cask card   |
| InfoRow          | `info-row/`          | Label-value display row |
| Breadcrumb       | `breadcrumb/`        | Navigation breadcrumb   |
| StatusBadge      | `status-badge/`      | Status indicator badge  |
| HeadingSettings  | `heading-settings/`  | Settings page heading   |
| ImagePlaceholder | `image-placeholder/` | Image with fallback     |
| LabelFilter      | `label-filter/`      | Filter tag pill         |
