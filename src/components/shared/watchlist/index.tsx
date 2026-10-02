"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HeadingContent from "../heading";
import IconList from "../icons/icon-list";
import LinkCustom from "../link-custom";
import ScrollAreaWithFade from "../scroll-area-with-fade";
import WatchlistItem, { TWatchlistItem } from "./watchlist-item";

const MOCK_WATCHLIST: TWatchlistItem[] = [
    {
        id: "1",
        name: "Benriach Ex-Bourbon Hogshead",
        floorPrice: 13000,
        imageUrl: "/images/cask/cask_1.jpg",
        hasAlert: false,
    },
    {
        id: "2",
        name: "Auchroisk Refill Bourbon Barrel",
        floorPrice: 13000,
        imageUrl: "/images/cask/cask_2.jpg",
        hasAlert: false,
    },
    {
        id: "3",
        name: "Caol Ila Ex-Bourbon Hogshead",
        floorPrice: 10500,
        imageUrl: "/images/cask/cask_3.jpg",
        alertPrice: 12000,
        gapPercentage: 1.3,
        hasAlert: true,
    },
    {
        id: "4",
        name: "Glenburgie Ex - Bourbon Hogshead",
        floorPrice: 11200,
        imageUrl: "/images/cask/cask_4.jpg",
        alertPrice: 12000,
        gapPercentage: 1.3,
        hasAlert: true,
    },
    {
        id: "5",
        name: "Aberlour Ex-Sherry Hogshead",
        floorPrice: 16800,
        imageUrl: "/images/cask/cask_5.jpg",
        hasAlert: false,
    },
    {
        id: "6",
        name: "Aberlour Ex-Sherry Hogshead",
        floorPrice: 16800,
        imageUrl: "/images/cask/cask_5.jpg",
        hasAlert: false,
    },
    {
        id: "7",
        name: "Aberlour Ex-Sherry Hogshead",
        floorPrice: 16800,
        imageUrl: "/images/cask/cask_5.jpg",
        hasAlert: false,
    },
    {
        id: "8",
        name: "Aberlour Ex-Sherry Hogshead",
        floorPrice: 16800,
        imageUrl: "/images/cask/cask_5.jpg",
        hasAlert: false,
    },
    {
        id: "9",
        name: "Aberlour Ex-Sherry Hogshead",
        floorPrice: 16800,
        imageUrl: "/images/cask/cask_5.jpg",
        hasAlert: false,
    },
];

type TProps = {
    className?: string;
    title?: string;
    viewAllHref?: string;
    items?: TWatchlistItem[];
};

export default function Watchlist({
    className,
    title = "Watchlist",
    viewAllHref = "#",
    items = MOCK_WATCHLIST,
}: TProps) {
    return (
        <div
            className={cn(
                "flex min-h-0 w-full flex-1 flex-col overflow-hidden",
                className
            )}
        >
            <div className="mx-6 -mb-px flex flex-shrink-0 items-center justify-between border-b py-3.5 tb:sticky tb:top-0 tb:mx-5 tb:border-b tb:py-2.5 tb:pb-3.5 mb:mx-4">
                <div className="flex items-center gap-2">
                    <div className="size-5 text-typo-primary">
                        <IconList />
                    </div>
                    <HeadingContent
                        tag="h3"
                        className="text-xl font-medium normal-case text-typo-primary tb:text-xl"
                    >
                        {title}
                    </HeadingContent>
                </div>
                <Button asChild variant="link">
                    <LinkCustom href={viewAllHref}>View All</LinkCustom>
                </Button>
            </div>

            <div className="relative mb-2 min-h-0 flex-1 px-3.5 tb:px-5 mb:px-4">
                <ScrollAreaWithFade className="h-full dk:max-h-[20.625rem]">
                    <div className="flex w-full flex-col">
                        {items.length > 0 ? (
                            items.map((item) => (
                                <WatchlistItem key={item.id} data={item} />
                            ))
                        ) : (
                            <p className="px-2.5 py-8 text-center text-sm text-typo-note">
                                Your watchlist is empty.
                            </p>
                        )}
                    </div>
                </ScrollAreaWithFade>
            </div>
        </div>
    );
}
