"use client";

import { cn, formatCurrency } from "@/lib/utils";
import ImagePlaceholder from "../image-placeholder";
import { HoverRow } from "../hover-row";
import { Button } from "@/components/ui/button";

export type TWatchlistItem = {
    id: string;
    name: string;
    floorPrice: number;
    imageUrl: string;
    alertPrice?: number;
    gapPercentage?: number;
    hasAlert?: boolean;
};

import { Plus } from "lucide-react";

export default function WatchlistItem({ data }: { data: TWatchlistItem }) {
    const { name, floorPrice, imageUrl, alertPrice, gapPercentage, hasAlert } =
        data;

    return (
        <HoverRow
            insetX="2.5"
            className={cn(
                "mx-2.5 grid h-[4.125rem] grid-cols-[298fr_70fr] items-center justify-between border-b border-bd-main transition-all first:border-t last:!border-b tb:mx-0 tb:h-14 tb:grid-cols-[391fr_257fr_122fr] tb:last:!border-b-0 mb:grid-cols-[2.1fr_0.9fr_0.4fr] mb:gap-x-2"
            )}
        >
            {/* Column 1: Cask Info */}
            <div className="flex min-w-0 items-center gap-1.5 py-0">
                {/* Thumbnail */}
                <div className="size-[2.625rem] flex-shrink-0 overflow-hidden rounded-full border border-bd-main shadow-sm mb:hidden">
                    <ImagePlaceholder
                        src={imageUrl}
                        width={72}
                        height={72}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex min-w-0 flex-col justify-center gap-1">
                    <h4 className="truncate text-sm font-semibold text-typo-primary mb:text-xs">
                        {name}
                    </h4>
                    <p className="whitespace-nowrap text-xs text-typo-note">
                        Floor Price{" "}
                        <span className="font-semibold text-typo-primary">
                            {formatCurrency(floorPrice)}
                        </span>
                    </p>
                </div>
            </div>

            {/* Column 2: Alert Info */}
            <div
                className={cn(
                    "flex h-full min-w-0 flex-col justify-center py-0 text-left duration-0 tb:gap-1",
                    hasAlert && "dk:group-hover/row:opacity-0"
                )}
            >
                {hasAlert ? (
                    <>
                        <span className="text-sm font-semibold text-brand-darker mb:text-xs">
                            {`<${formatCurrency(alertPrice || 0)}`}
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap text-sm text-typo-note tb:text-xs">
                            Gap{" "}
                            <span className="font-semibold text-typo-primary">
                                {gapPercentage}%
                            </span>
                        </span>
                    </>
                ) : (
                    <span className="mb-auto py-3 text-sm font-medium text-typo-note mb:text-xs">
                        No Alert
                    </span>
                )}
            </div>

            {/* Column 3: Action Button */}
            <div
                className={cn(
                    "absolute right-0 top-1/2 flex -translate-y-1/2 justify-end py-0 transition-all duration-200 dk:opacity-0",
                    hasAlert && "dk:group-hover/row:opacity-100"
                )}
            >
                <Button
                    variant="action"
                    size="sm"
                    className="w-[4.375rem] text-typo-dark-primary tb:w-[3.75rem] mb:aspect-square mb:size-[1.875rem] mb:p-0"
                >
                    <span className="block mb:hidden">Add</span>
                    <Plus className="hidden size-3.5 mb:block" />
                </Button>
            </div>
        </HoverRow>
    );
}
