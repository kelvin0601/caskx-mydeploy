import { cn } from "@/lib/utils";
import { m, useInView } from "motion/react";
import React, { useEffect, useRef, useState, memo } from "react";
import { Carousel, CarouselContent } from "@/components/ui/carousel";

type TVintageItem = {
    id: string;
    year: number | string;
    isActive: boolean;
};

type TVintageSelectorProps = {
    vintages: TVintageItem[];
    onVintageClick: (id: string) => void;
};

function VintageSelector({ vintages, onVintageClick }: TVintageSelectorProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
        }, 100);
    }, []);

    const sentinelRef = useRef<HTMLDivElement>(null);
    // const inView = useInView(sentinelRef);
    // const isSticky = mounted ? !inView : false;

    if (vintages.length === 0) return null;
    return (
        <>
            <div
                ref={sentinelRef}
                className="pointer-events-none absolute left-0 right-0 h-px"
                style={{ top: "calc(-1 * (var(--height-header)))" }}
            />
            <div
                className={cn(
                    "sticky top-[calc(var(--height-header)+1px)] z-10 -ml-[var(--padding-container)] -mr-[var(--padding-container)] flex flex-row items-stretch overflow-hidden border-bd-main bg-bg-main transition-colors duration-150 ease-in-out header-hidden:top-px tb:border-t"
                )}
            >
                <div
                    className={cn(
                        "flex h-10 shrink-0 items-center justify-center border-b border-r border-bd-main px-6 tb:px-5 mb:px-4 py-3"
                    )}
                >
                    <span className={cn("text-sm font-normal text-typo-sub")}>
                        Select vintage
                    </span>
                </div>
                <Carousel
                    opts={{
                        dragFree: true,
                        align: "start",
                    }}
                    className="h-10 flex-1 overflow-visible border-b"
                >
                    <CarouselContent
                        className="flex flex-row"
                        classNameParent="overflow-visible"
                    >
                        {vintages.map((v) => (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => onVintageClick(v.id)}
                                className={cn(
                                    "relative h-full shrink-0 border-r border-bd-main px-6 py-2.5 text-sm tb:px-5 mb:px-4   font-semibold transition-colors duration-200",
                                    v.isActive
                                        ? "text-typo-primary"
                                        : "border-b text-typo-soft"
                                )}
                            >
                                <span className="relative z-10">{v.year}</span>
                                {v.isActive && (
                                    <m.div
                                        layoutId="active-vintage"
                                        className="absolute inset-0 z-0 h-full min-h-[calc(100%+1px)] translate-y-px bg-[#f4f0ea]"
                                        transition={{
                                            type: "spring",
                                            bounce: 0.15,
                                            duration: 0.4,
                                        }}
                                    />
                                )}
                            </button>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </>
    );
}

export default memo(VintageSelector);
