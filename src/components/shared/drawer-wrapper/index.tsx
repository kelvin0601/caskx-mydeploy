"use client";

import {
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Key, ReactNode } from "react";

type DrawerWrapperProps = {
    title: string;
    description?: string;
    headerAside?: ReactNode;
    children: ReactNode;
    footer: ReactNode;
    contentKey?: Key;
    isLoading?: boolean;
    fullHeight?: boolean;
};

export default function DrawerWrapper({
    title,
    description,
    headerAside,
    children,
    footer,
    contentKey = "drawer-content",
    isLoading = false,
    fullHeight = false,
}: DrawerWrapperProps) {
    const bodyDrawerRef = useRef<HTMLDivElement | null>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const bodyDrawer = bodyDrawerRef.current;
        if (!bodyDrawer) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const currentEntry = entries.find(
                (entry) => entry.target === bodyDrawer
            );
            if (currentEntry) setHeight(currentEntry.target.clientHeight);
        });

        resizeObserver.observe(bodyDrawer);
        return () => resizeObserver.disconnect();
    }, [contentKey]);

    return (
        <DrawerContent
            className={cn(
                "bg-bg-main px-0 tb:px-0 tb:pb-5 tb:pt-[1.375rem] mb:pt-5",
                fullHeight
                    ? "max-h-dvh j-tb:h-auto j-tb:p-0 mb:h-auto mb:p-0 j-tb:[&_[data-drawer-close]>div]:!size-4 mb:[&_[data-drawer-close]>div]:!size-4 j-tb:[&_[data-drawer-close]]:right-5 j-tb:[&_[data-drawer-close]]:top-3 j-tb:[&_[data-drawer-close]]:flex j-tb:[&_[data-drawer-close]]:size-10 j-tb:[&_[data-drawer-close]]:items-center j-tb:[&_[data-drawer-close]]:justify-center j-tb:[&_[data-drawer-close]]:p-0 mb:[&_[data-drawer-close]]:right-4 mb:[&_[data-drawer-close]]:top-2.5 mb:[&_[data-drawer-close]]:flex mb:[&_[data-drawer-close]]:size-10 mb:[&_[data-drawer-close]]:items-center mb:[&_[data-drawer-close]]:justify-center mb:[&_[data-drawer-close]]:p-0"
                    : "max-h-[65vh] mb:max-h-screen"
            )}
        >
            <DrawerTitle className="sr-only">{title}</DrawerTitle>
            <DrawerDescription className="sr-only">
                {description ?? `${title} drawer`}
            </DrawerDescription>

            <div
                className={cn(
                    "container grid grid-cols-16 tb:grid-cols-12 mb:grid-cols-4",
                    fullHeight &&
                        "j-tb:h-auto j-tb:grid-rows-[4rem_auto_5rem] j-tb:!px-5 mb:h-auto"
                )}
            >
                <div
                    className={cn(
                        "col-start-4 -col-end-4 tb:col-start-1 tb:-col-end-1",
                        fullHeight &&
                            "j-tb:flex j-tb:h-full j-tb:items-center j-tb:border-b j-tb:border-bd-main mb:relative mb:flex mb:h-[3.75rem] mb:items-center mb:after:absolute mb:after:inset-x-[-1rem] mb:after:bottom-0 mb:after:h-px mb:after:bg-bd-main"
                    )}
                >
                    {isLoading ? (
                        <div
                            className={cn(
                                "flex items-center pb-[1.125rem] mb:pb-5",
                                fullHeight && "j-tb:pb-0 mb:h-full mb:pb-0"
                            )}
                        >
                            <Skeleton className="h-5 w-32" />
                        </div>
                    ) : (
                        <div
                            className={cn(
                                "flex min-w-0 items-center justify-between gap-4 pb-[1.125rem] tb:pr-8 mb:pb-5",
                                fullHeight &&
                                    "j-tb:w-full j-tb:pb-0 mb:h-full mb:w-full mb:pb-0"
                            )}
                        >
                            <h2 className="min-w-0 font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                                {title}
                            </h2>
                            {headerAside}
                        </div>
                    )}
                </div>

                <Separator
                    className={cn(
                        "col-span-full -mx-[var(--size-open-container)] w-auto",
                        fullHeight && "j-tb:hidden mb:hidden"
                    )}
                />

                <div
                    className={cn(
                        "col-start-4 -col-end-4 min-w-0 tb:col-start-1 tb:-col-end-1",
                        fullHeight && "j-tb:min-h-0 j-tb:overflow-hidden"
                    )}
                >
                    <AnimatePresence mode="popLayout">
                        <m.div
                            ref={bodyDrawerRef}
                            key={contentKey}
                            initial={{
                                height,
                                opacity: 0,
                                transition: {
                                    duration: 0.1,
                                    ease: [0.32, 0.72, 0, 1],
                                },
                            }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{
                                height,
                                opacity: 0,
                                transition: {
                                    duration: 0.1,
                                    ease: [0.32, 0.72, 0, 1],
                                },
                            }}
                            onAnimationComplete={() => {
                                const bodyHeight =
                                    bodyDrawerRef.current?.clientHeight;
                                if (bodyHeight) setHeight(bodyHeight);
                            }}
                            transition={{
                                duration: 0.3,
                                ease: [0.32, 0.72, 0, 1],
                            }}
                        >
                            <ScrollArea
                                className={cn(
                                    "-mr-4 pr-4",
                                    fullHeight
                                        ? "max-h-[calc(100dvh-6.5rem-3.75rem)] j-tb:max-h-[calc(100dvh-9rem)] mb:max-h-[calc(100dvh-8.5rem)]"
                                        : "max-h-[calc(65vh-6.5rem-3.75rem)] mb:max-h-[calc(100vh-4.75rem-4rem)]"
                                )}
                            >
                                {children}
                            </ScrollArea>
                        </m.div>
                    </AnimatePresence>
                </div>

                <Separator
                    className={cn(
                        "col-span-full -mx-[var(--size-open-container)] mb-6 w-auto tb:mb-5 mb:mb-4",
                        fullHeight && "j-tb:hidden mb:hidden"
                    )}
                />

                <div
                    className={cn(
                        "col-start-4 -col-end-4 tb:col-start-1 tb:-col-end-1",
                        fullHeight &&
                            "j-tb:flex j-tb:h-full j-tb:items-center j-tb:justify-end j-tb:border-t j-tb:border-bd-main mb:relative mb:flex mb:h-[4.75rem] mb:items-start mb:pb-5 mb:pt-4 mb:before:absolute mb:before:inset-x-[-1rem] mb:before:top-0 mb:before:h-px mb:before:bg-bd-main mb:[&>*]:w-full"
                    )}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-between py-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    ) : (
                        footer
                    )}
                </div>
            </div>
        </DrawerContent>
    );
}
