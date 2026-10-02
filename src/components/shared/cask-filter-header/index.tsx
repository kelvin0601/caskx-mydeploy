import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import LinkCustom from "../link-custom";
import HeadingContent from "../heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "motion/react";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { useQueryClient } from "@tanstack/react-query";
import { CASK_KEYS } from "@/lib/constants";
import caskMasterServices from "@/services/cask-master";

type TFilterOption = {
    label: string;
    value: string;
};

type TCaskFilterHeaderProps = {
    title: string;
    filters: TFilterOption[];
    activeFilter: string;
    onFilterChange: (value: string) => void;
    viewAllHref?: string;
    className?: string;
    isLoading?: boolean;
};

const CaskFilterHeader: React.FC<TCaskFilterHeaderProps> = ({
    title,
    filters,
    activeFilter,
    onFilterChange,
    viewAllHref,
    className,
    isLoading = false,
}) => {
    const endRef = useRef<HTMLDivElement>(null);
    const isAtEnd = useInView(endRef, {});
    const startRef = useRef<HTMLDivElement>(null);
    const isAtStart = useInView(startRef, {
        margin: "10px",
    });

    const [api, setApi] = useState<CarouselApi>();
    const prevIndexRef = useRef<number | null>(null);

    useEffect(() => {
        if (!api) return;
        const destIndex = filters.findIndex((f) => f.value === activeFilter);
        console.log("prevIndex", prevIndexRef.current);
        console.log("destIndex", destIndex);

        if (destIndex !== -1) {
            const prevIndex = prevIndexRef.current;

            if (prevIndex !== null && destIndex !== prevIndex) {
                if (destIndex > prevIndex) {
                    api.goTo(Math.min(destIndex + 2, filters.length + 1));
                } else {
                    api.goTo(Math.max(destIndex, 0));
                }
            } else if (prevIndex === null && destIndex !== 0) {
                api.goTo(destIndex + 1);
            }

            prevIndexRef.current = destIndex;
        }
    }, [api, activeFilter, filters]);

    const queryClient = useQueryClient();

    return (
        <div
            className={cn(
                "relative mb-4 flex flex-row items-center justify-between tb:mb-4 mb:flex-col mb:items-start mb:gap-3",
                className
            )}
        >
            <HeadingContent tag="h2" className="mb:py-2.5">
                {isLoading ? (
                    <Skeleton className="h-10 w-48 animate-pulse bg-bg-sf1" />
                ) : (
                    title
                )}
            </HeadingContent>

            <div className="flex flex-row items-center gap-1 mb:-mx-0.5 mb:w-full mb:flex-col-reverse mb:overflow-hidden">
                <div
                    className={cn(
                        "pointer-events-none absolute bottom-0 right-0 z-10 hidden size-10 translate-x-px bg-[linear-gradient(90deg,rgba(255,252,246,0)_0%,#FFFCF6_100%)] transition-opacity duration-300 mb:block",
                        isAtEnd && "opacity-0"
                    )}
                />
                <div
                    className={cn(
                        "pointer-events-none absolute -left-px bottom-0 z-10 hidden size-10 -translate-x-px bg-[linear-gradient(-90deg,rgba(255,252,246,0)_0%,#FFFCF6_100%)] transition-opacity duration-300 mb:block",
                        isAtStart && "opacity-0"
                    )}
                />
                {
                    <Carousel
                        setApi={setApi}
                        opts={{
                            dragFree: true,
                            align: "start",
                        }}
                        className="w-full mb:overflow-visible"
                    >
                        <CarouselContent className="-mr-0.5 ml-auto flex w-max flex-row mb:ml-0 mb:w-auto">
                            <div
                                ref={startRef}
                                className="h-px w-px shrink-0"
                            />
                            {filters.map((filter) => {
                                const valWOutState =
                                    filter?.value?.split("&")[0];
                                const isActive =
                                    activeFilter?.split("&")[0] ===
                                    valWOutState;
                                return (
                                    <CarouselItem
                                        key={filter.value}
                                        className="basis-auto px-0.5"
                                        onMouseEnter={() => {
                                            queryClient.prefetchQuery({
                                                queryKey: [
                                                    CASK_KEYS.LIST_CASK,
                                                    "explore",
                                                    filter.value,
                                                ],
                                                queryFn: () =>
                                                    caskMasterServices.getCaskMastersListing(
                                                        filter.value
                                                    ),
                                            });
                                        }}
                                    >
                                        <Button
                                            variant={"tab"}
                                            onClick={() =>
                                                onFilterChange(filter.value)
                                            }
                                            className={cn(
                                                "h-10 px-5 font-semibold transition-all duration-200 tb:px-4",
                                                isActive
                                                    ? "bg-bg-dark-main text-typo-dark-primary"
                                                    : ""
                                            )}
                                        >
                                            {filter.label}
                                        </Button>
                                    </CarouselItem>
                                );
                            })}
                            <div
                                ref={endRef}
                                className="h-px w-px shrink-0 -translate-x-3"
                            />
                        </CarouselContent>
                    </Carousel>
                }

                {viewAllHref &&
                    (isLoading ? (
                        <Skeleton className="h-10 w-24 animate-pulse rounded-md bg-bg-sf1" />
                    ) : (
                        <Button
                            variant="outline-text"
                            className="h-10 text-typo-primary mb:absolute mb:right-0 mb:top-0"
                            asChild
                        >
                            <LinkCustom
                                className="text-sm font-medium"
                                href={viewAllHref}
                            >
                                View All
                            </LinkCustom>
                        </Button>
                    ))}
            </div>
        </div>
    );
};

export default CaskFilterHeader;

export const CaskFilterHeaderSkeleton = () => {
    return (
        <div className="mb-4 flex w-full flex-row justify-between gap-2 mb:flex-col">
            <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-10 w-48 bg-bg-sf3" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-32 bg-bg-sf3" />
                <Skeleton className="h-10 w-32 bg-bg-sf3 tb:hidden" />
                <Skeleton className="h-10 w-32 bg-bg-sf3" />
                <Skeleton className="h-10 w-32 bg-bg-sf3 mb:hidden" />
                <Skeleton className="h-10 w-32 bg-bg-sf3 mb:hidden" />
            </div>
        </div>
    );
};
