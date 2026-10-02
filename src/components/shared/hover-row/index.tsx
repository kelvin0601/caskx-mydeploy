import { cn } from "@/lib/utils";
import React from "react";

/**
 * Reusable hover-row effect classes.
 *
 * Renders a `::after` pseudo-element behind content that transitions to show
 * a border + tinted background on hover. Children should use `relative z-10`
 * to stay above the pseudo-element.
 *
 * @param insetX — horizontal overshoot (default `6` → `after:-inset-x-6`).
 *   Use `"2.5"` for home/market-activities rows that sit inside a `mx-2.5` wrapper,
 *   or `"6"` for sidebar rows inside `p-6` padding,
 *   or `"3"` for table-cask rows inside `px-3`.
 */

/** Base classes shared by every hover-row variant */
const HOVER_ROW_CORE = [
    "group/row relative z-[2] [&_*]:z-[2]",
    "after:content-['']",
    "after:absolute after:-inset-y-px",
    "after:border after:border-transparent after:bg-transparent",
    "after:transition-all",
    "hover:after:border-bd-main hover:after:bg-bg-sf2  hover:after:z-index-[1] ",
    "transition-all",
].join(" ");

/**
 * Pre-composed class strings for common inset-x values.
 * Append one of these to HOVER_ROW_CORE (or use `hoverRowClasses()`).
 */
const HOVER_INSET = {
    "0": "after:inset-x-0",
    "2.5": "after:-inset-x-2.5",
    "3": "after:-inset-x-3",
    "6": "after:-inset-x-6",
} as const;

type InsetKey = keyof typeof HOVER_INSET;

/**
 * Returns the full hover-row class string for a given inset-x value.
 *
 * @example
 * ```tsx
 * <TableRow className={cn(hoverRowClasses("6"), "grid grid-cols-2 py-3")}>
 * ```
 */
function hoverRowClasses(insetX: InsetKey = "6"): string {
    return cn(HOVER_ROW_CORE, HOVER_INSET[insetX]);
}

/**
 * `<HoverRow>` — Drop-in wrapper component.
 *
 * Prefer `hoverRowClasses()` when you need to compose with `<TableRow>` or
 * any element that already controls its own tag.
 */
export type HoverRowProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
    /** Horizontal overshoot of the pseudo-element. Default `"6"`. */
    insetX?: InsetKey;
    children: React.ReactNode;
};

const HoverRow = React.forwardRef<HTMLDivElement, HoverRowProps>(
    ({ className, insetX = "6", children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(hoverRowClasses(insetX), className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

HoverRow.displayName = "HoverRow";

export { HoverRow, hoverRowClasses, HOVER_ROW_CORE, HOVER_INSET };
export default HoverRow;
