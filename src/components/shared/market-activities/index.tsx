"use client";

import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import HeadingContent from "../heading";
import { HoverRow } from "../hover-row";

import { ScrollArea } from "@/components/ui/scroll-area";

import IconChevonDown from "../icons/icon-chevon-down";
import IconTrending from "../icons/icon-trending";
import ScrollAreaWithFade from "../scroll-area-with-fade";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { ShoppingBag } from "lucide-react";

export type TMarketActivity = {
    id: string;
    caskName: string;
    type: "Listing" | "Offer";
    price: number;
    expiryAt: string;
};

const MOCK_ACTIVITIES: TMarketActivity[] = [
    {
        id: "1",
        caskName: "Benriach Ex-Bourbon Hogshead",
        type: "Listing",
        price: 12200,
        expiryAt: "12h",
    },
    {
        id: "2",
        caskName: "Caol Ila Ex-Bourbon Hogshead 1999",
        type: "Offer",
        price: 11400,
        expiryAt: "12h",
    },
    {
        id: "3",
        caskName: "Auchroisk Refill Bourbon Barrel 2001",
        type: "Listing",
        price: 10800,
        expiryAt: "3 days",
    },
    {
        id: "4",
        caskName: "Glenburgie Ex - Bourbon Hogshead 2021",
        type: "Offer",
        price: 11500,
        expiryAt: "16h",
    },
    {
        id: "5",
        caskName: "Aberlour Ex-Sherry Hogshead 2023",
        type: "Offer",
        price: 12600,
        expiryAt: "7h",
    },
    {
        id: "6",
        caskName: "Craigellachie Ex-Bourbon Hogshead",
        type: "Listing",
        price: 10700,
        expiryAt: "2 days",
    },
    {
        id: "7",
        caskName: "Ballantine's The GlenburgieHogshead",
        type: "Offer",
        price: 13100,
        expiryAt: "5 days",
    },
    {
        id: "8",
        caskName: "Scotch Malt Whisky Hogshead",
        type: "Listing",
        price: 11900,
        expiryAt: "22h",
    },
];

export default function MarketActivities({
    className,
    items = MOCK_ACTIVITIES,
}: {
    className?: string;
    items?: TMarketActivity[];
}) {
    return (
        <div
            className={cn(
                "flex min-h-0 w-full flex-1 flex-col overflow-hidden",
                className
            )}
        >
            {/* Header */}
            <div className="mx-6 -mb-px flex items-center justify-between border-b py-3.5 tb:mx-5 tb:border-none tb:py-2.5 tb:pb-3.5 mb:mx-4 mb:py-2.5 mb:pb-3.5">
                <div className="flex items-center gap-2">
                    <div className="size-5 text-typo-primary">
                        <IconTrending />
                    </div>
                    <HeadingContent
                        tag="h3"
                        className="text-xl font-medium normal-case text-typo-primary tb:text-xl"
                    >
                        Market Activities
                    </HeadingContent>
                </div>
                <Select defaultValue="all">
                    <SelectTrigger
                        aria-label="Filter market activities by type"
                        className="h-auto w-auto min-w-0 gap-1 border-none bg-transparent p-0 text-sm font-medium text-typo-primary shadow-none outline-none ring-0 focus:ring-0 data-[state=open]:ring-0"
                    >
                        <SelectValue placeholder="All Type" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="all">All Type</SelectItem>
                        <SelectItem value="listing">Listing</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="relative mb-2 min-h-0 flex-1 px-3.5 tb:px-5 mb:px-4">
                <ScrollAreaWithFade className="h-full dk:max-h-[24.75rem]">
                    <div className="w-full">
                        <div className="flex w-full flex-col">
                            <div className="sticky top-0 z-10 mx-2.5 grid grid-cols-[150fr_62fr_62fr_62fr] gap-2 border-y !border-bd-main bg-bg-main py-3 tb:mx-0 tb:grid-cols-[324fr_122fr_122fr_55fr_122fr] mb:grid-cols-[1.8fr_1fr_1.3fr_1fr_0.8fr] mb:!gap-x-2">
                                <div className="whitespace-nowrap text-left text-xs leading-[1] text-typo-note">
                                    Cask
                                </div>
                                <div className="whitespace-nowrap text-left text-xs leading-[1] text-typo-note">
                                    Type
                                </div>
                                <div className="whitespace-nowrap text-left text-xs leading-[1] text-typo-note">
                                    Price
                                </div>
                                <div className="whitespace-nowrap text-left text-xs leading-[1] text-typo-note">
                                    Expiry In
                                </div>
                                <div className="hidden whitespace-nowrap text-right text-xs leading-[1] text-typo-note mb:block"></div>
                            </div>
                            <div className="flex w-full flex-col">
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <HoverRow
                                            key={item.id}
                                            insetX="2.5"
                                            className="mx-2.5 grid h-14 grid-cols-[150fr_62fr_62fr_62fr] items-center gap-2 border-b border-bd-main transition-all last:!border-b dk:h-11 tb:mx-0 tb:grid-cols-[324fr_122fr_122fr_55fr_122fr] tb:last:!border-b-0 mb:grid-cols-[1.8fr_1fr_1.3fr_1fr_0.8fr] mb:!gap-x-2"
                                        >
                                            <div className="min-w-0 py-0 text-left text-sm font-semibold text-typo-primary mb:text-xs">
                                                <span className="block truncate">
                                                    {item.caskName}
                                                </span>
                                            </div>
                                            <div className="py-0 text-left text-xs text-typo-primary">
                                                {item.type}
                                            </div>
                                            <div className="py-0 text-left text-xs font-semibold text-typo-primary">
                                                {formatCurrency(item.price)}
                                            </div>
                                            <div className="py-0 text-left text-xs text-typo-primary">
                                                <span className="transition-opacity duration-150 dk:group-hover/row:opacity-0">
                                                    {" "}
                                                    {item.expiryAt}
                                                </span>
                                                <div className="absolute right-0 top-1/2 flex -translate-y-1/2 justify-center py-0 transition-all duration-200 dk:opacity-0 dk:group-hover/row:opacity-100 tb:absolute tb:right-0 mb:size-[1.857rem] mb:justify-end">
                                                    <Button
                                                        variant="action"
                                                        size="sm"
                                                        className="text-typo-dark-primary dk:min-w-[3.875rem] mb:aspect-square mb:w-full mb:p-0"
                                                    >
                                                        <span className="block mb:hidden">
                                                            Buy
                                                        </span>
                                                        <ShoppingBag className="hidden size-3.5 mb:block" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </HoverRow>
                                    ))
                                ) : (
                                    <p className="px-2.5 py-8 text-center text-sm text-typo-note">
                                        No market activity available.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollAreaWithFade>
            </div>
        </div>
    );
}
