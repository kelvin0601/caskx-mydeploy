"use client";

import LinkCustom from "@/components/shared/link-custom";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { MENU_SETTINGS } from "@/lib/constants";
import { AUTH_KEYS } from "@/lib/constants/key";
import { cn } from "@/lib/utils";
import { m } from "motion/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function MenuSettings({ className }: { className?: string }) {
    const pathname = usePathname();
    const [hoveredHref, setHoveredHref] = useState<string | null>(null);
    const { status } = useGetStateQuery({
        key: [AUTH_KEYS.WHOAMI],
    });

    if (status === "pending") {
        return <MenuSettingsSkeleton className={className} />;
    }

    const activeItem =
        MENU_SETTINGS.find((item) => pathname.includes(item.href)) ||
        MENU_SETTINGS[0];

    const ActiveIcon = activeItem.Icon;

    return (
        <div
            className={cn(
                "relative h-full border-r border-bd-main pr-0 pt-0 tb:border-r-0 tb:px-0 tb:pt-0",
                className
            )}
        >
            <div className="sticky top-[var(--height-header)] z-[2] flex w-full flex-col transition-all header-hidden:top-0 tb:static mb:-mx-[var(--padding-container)] mb:w-auto mb:border-b mb:border-bd-main mb:px-0">
                <h3 className="hidden py-4 pl-[var(--padding-container)] font-reckless text-xl font-medium leading-[1] text-typo-primary dk:block">
                    Settings
                </h3>
                <div className="hidden w-full mb:block">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem
                            value="settings-menu"
                            className="border-b-0"
                        >
                            <AccordionTrigger className="bg-bg-main p-4 py-4 font-semibold text-typo-primary">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 shrink-0">
                                        <ActiveIcon />
                                    </div>
                                    <div className="whitespace-nowrap text-sm">
                                        {activeItem.title}
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0 pb-0">
                                <div className="flex w-full flex-col border-t border-bd-main bg-bg-main">
                                    {MENU_SETTINGS.map((item, index) => {
                                        const Icon = item.Icon;
                                        const isActive = pathname.includes(
                                            item.href
                                        );

                                        return (
                                            <LinkCustom
                                                href={`${item.href}`}
                                                key={index}
                                                className="group flex w-full cursor-pointer flex-row border-b border-bd-main capitalize last:border-b-0"
                                            >
                                                <div
                                                    className={cn(
                                                        "relative flex w-full flex-row items-center gap-2 p-4 transition-all",
                                                        isActive
                                                            ? "text-typo-primary"
                                                            : "text-typo-primary/50 hover:bg-bg-sf4/50 hover:text-typo-primary"
                                                    )}
                                                >
                                                    <div className="h-4 w-4 shrink-0">
                                                        <Icon />
                                                    </div>
                                                    <div className="text whitespace-nowrap text-sm font-semibold">
                                                        {item.title}
                                                    </div>
                                                    {isActive && (
                                                        <div className="ml-auto size-[0.3125rem] shrink-0 rounded-full bg-typo-primary" />
                                                    )}
                                                </div>
                                            </LinkCustom>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Desktop & Tablet: Sidebar List UI */}
                <div className="flex w-full flex-col tb:-mx-[var(--padding-container)] tb:w-auto tb:flex-row mb:hidden">
                    {MENU_SETTINGS.map((item, index) => {
                        const Icon = item.Icon;
                        const isActive = pathname.includes(item.href);
                        const isIndicatorActive = hoveredHref
                            ? hoveredHref === item.href
                            : isActive;

                        return (
                            <LinkCustom
                                href={`${item.href}`}
                                key={index}
                                className="group flex w-full cursor-pointer flex-row capitalize text-typo-primary first:border-t tb:border-r tb:last:border-0 mb:border-0"
                            >
                                <div
                                    onMouseEnter={() =>
                                        setHoveredHref(item.href)
                                    }
                                    onMouseLeave={() => setHoveredHref(null)}
                                    className={cn(
                                        "relative flex w-full flex-row items-center gap-2 border-b border-bd-main px-6 py-4 text-typo-primary transition-all",
                                        isActive || hoveredHref === item.href
                                            ? "text-typo-primary"
                                            : "text-typo-soft hover:text-typo-primary"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-4 w-4 shrink-0 transition-colors",
                                            isActive ||
                                                hoveredHref === item.href
                                                ? "text-typo-primary"
                                                : "text-icon group-hover:text-typo-primary"
                                        )}
                                    >
                                        <Icon />
                                    </div>
                                    <div className="whitespace-nowrap text-sm font-semibold">
                                        {item.title}
                                    </div>

                                    {/* Desktop: Animated moving dot */}
                                    {isIndicatorActive && (
                                        <m.div
                                            layoutId="desktop-menu-dot"
                                            className="ml-auto size-[0.375rem] shrink-0 rounded-full bg-typo-primary tb:hidden"
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 30,
                                            }}
                                        />
                                    )}

                                    {/* Tablet: Static dot for active item only */}
                                    {isActive && (
                                        <div className="ml-2 hidden size-[0.375rem] shrink-0 rounded-full bg-typo-primary tb:block" />
                                    )}
                                </div>
                            </LinkCustom>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export const MenuSettingsSkeleton = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "relative h-full border-r border-bd-main pr-0 pt-0 tb:border-r-0 tb:px-0 tb:pt-0",
                className
            )}
        >
            <div className="sticky top-[7rem] flex w-full flex-col transition-all duration-500 header-hidden:top-[2rem] tb:static tb:border-b tb:border-bd-main">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="flex w-full flex-row items-center gap-2 border-b border-bd-main p-4 last:border-b-0 tb:px-4"
                    >
                        <Skeleton className="h-4 w-4 shrink-0 bg-bg-sf2" />
                        <Skeleton className="h-4 w-24 bg-bg-sf2" />
                    </div>
                ))}
            </div>
        </div>
    );
};
