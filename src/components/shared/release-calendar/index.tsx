"use client";

import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { Bell } from "lucide-react";
import HeadingContent from "../heading";
import { HoverRow } from "../hover-row";
import IconCalendar from "../icons/icon-calendar";
import ImagePlaceholder from "../image-placeholder";
import ScrollAreaWithFade from "../scroll-area-with-fade";

export type TReleaseItem = {
    id: string;
    name: string;
    releaseDate: string;
    priceFrom: number;
    priceTo: number;
    imageUrl: string;
};

const MOCK_RELEASES: TReleaseItem[] = [
    {
        id: "1",
        name: "Aberlour Ex-Sherry Hogshead 2023",
        releaseDate: "Oct 25, 2026",
        priceFrom: 12000,
        priceTo: 15000,
        imageUrl: "/images/cask/cask_5.jpg",
    },
    {
        id: "2",
        name: "Caol Ila Ex-Bourbon Hogshead 1999",
        releaseDate: "Nov 14, 2026",
        priceFrom: 13000,
        priceTo: 17000,
        imageUrl: "/images/cask/cask_3.jpg",
    },
    {
        id: "3",
        name: "Benriach Ex-Bourbon Hogshead 2022",
        releaseDate: "Nov 20, 2026",
        priceFrom: 13500,
        priceTo: 16000,
        imageUrl: "/images/cask/cask_1.jpg",
    },
    {
        id: "4",
        name: "Glenburgie Ex - Bourbon Hogshead 2021",
        releaseDate: "Dec 9, 2026",
        priceFrom: 14000,
        priceTo: 18000,
        imageUrl: "/images/cask/cask_4.jpg",
    },
    {
        id: "5",
        name: "Aberlour Ex-Sherry Hogshead 2023",
        releaseDate: "Oct 25, 2026",
        priceFrom: 12000,
        priceTo: 15000,
        imageUrl: "/images/cask/cask_5.jpg",
    },
    {
        id: "6",
        name: "Caol Ila Ex-Bourbon Hogshead 1999",
        releaseDate: "Nov 14, 2026",
        priceFrom: 13000,
        priceTo: 17000,
        imageUrl: "/images/cask/cask_3.jpg",
    },
    {
        id: "7",
        name: "Benriach Ex-Bourbon Hogshead 2022",
        releaseDate: "Nov 20, 2026",
        priceFrom: 13500,
        priceTo: 16000,
        imageUrl: "/images/cask/cask_1.jpg",
    },
    {
        id: "8",
        name: "Glenburgie Ex - Bourbon Hogshead 2021",
        releaseDate: "Dec 9, 2026",
        priceFrom: 14000,
        priceTo: 18000,
        imageUrl: "/images/cask/cask_4.jpg",
    },
];

type TReleaseCalendarProps = {
    className?: string;
    items?: TReleaseItem[];
};

export default function ReleaseCalendar({
    className,
    items = MOCK_RELEASES,
}: TReleaseCalendarProps) {
    return (
        <div
            className={cn(
                "flex min-h-0 flex-1 flex-col overflow-hidden",
                className
            )}
        >
            {/* Header */}
            <div className="mx-6 -mb-px flex items-center gap-2 border-b py-3.5 tb:mx-5 tb:pb-3.5 mb:mx-4 mb:py-2.5">
                <div className="size-5 text-typo-primary">
                    <IconCalendar />
                </div>
                <HeadingContent
                    tag="h3"
                    className="text-xl font-medium normal-case tracking-tight text-typo-primary tb:text-xl"
                >
                    Release Calendar
                </HeadingContent>
            </div>

            {/* List */}
            <div className="relative mb-2 min-h-0 flex-1 px-3.5 tb:px-5 mb:px-4">
                <ScrollAreaWithFade className="h-full dk:max-h-[20.625rem]">
                    <div className="flex w-full flex-col">
                        {items.length > 0 ? (
                            items.map((item) => (
                                <HoverRow
                                    key={item.id}
                                    insetX="2.5"
                                    className="mx-2.5 grid h-[4.125rem] grid-cols-[244fr_124fr] items-center justify-between border-b border-bd-main transition-all first:border-t last:!border-b tb:mx-0 tb:grid-cols-[383fr_257fr_122fr] tb:last:!border-b-0 mb:h-14 mb:grid-cols-[2.1fr_1fr_0.4fr]"
                                >
                                    <div className="flex min-w-0 items-center gap-1.5 py-0">
                                        {/* Thumbnail */}
                                        <div className="size-[2.625rem] flex-shrink-0 overflow-hidden rounded-full border border-bd-main shadow-sm mb:hidden">
                                            <ImagePlaceholder
                                                src={item.imageUrl}
                                                width={72}
                                                height={72}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex min-w-0 max-w-[10.25rem] flex-col justify-center gap-1">
                                            <h4 className="truncate text-sm font-semibold text-typo-primary mb:text-xs">
                                                {item.name}
                                            </h4>
                                            <p className="whitespace-nowrap text-xs text-typo-note">
                                                Release date{" "}
                                                <span className="pl-1 font-semibold text-typo-primary">
                                                    {item.releaseDate}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex min-w-0 justify-center gap-1 py-0 text-left transition-all duration-150 dk:group-hover/row:opacity-0 tb:justify-start mb:flex-col">
                                        <div className="flex items-center gap-1 text-sm mb:text-xs">
                                            <span className="hidden text-xs font-normal text-typo-note mb:block mb:w-[1.8125rem]">
                                                From
                                            </span>
                                            <span className="font-semibold text-typo-primary">
                                                {formatCurrency(item.priceFrom)}
                                            </span>
                                        </div>
                                        <span className="mb:hidden">-</span>
                                        <div className="flex items-center gap-1 text-sm mb:text-xs">
                                            <span className="hidden text-xs font-normal text-typo-note mb:block mb:w-[1.8125rem]">
                                                To
                                            </span>
                                            <span className="font-semibold text-typo-primary">
                                                {formatCurrency(item.priceTo)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute right-0 flex min-w-[7.75rem] justify-end py-0 transition-all duration-200 dk:opacity-0 dk:group-hover/row:opacity-100 mb:size-[1.875rem] mb:min-w-0">
                                        <Button
                                            variant="action"
                                            size="sm"
                                            className="w-full text-typo-dark-primary mb:aspect-square mb:w-full mb:p-0"
                                        >
                                            <span className="mb:hidden">
                                                Notify Me
                                            </span>
                                            <Bell className="hidden size-3.5 mb:block" />
                                        </Button>
                                    </div>
                                </HoverRow>
                            ))
                        ) : (
                            <p className="px-2.5 py-8 text-center text-sm text-typo-note">
                                No upcoming releases.
                            </p>
                        )}
                    </div>
                </ScrollAreaWithFade>
            </div>
        </div>
    );
}
