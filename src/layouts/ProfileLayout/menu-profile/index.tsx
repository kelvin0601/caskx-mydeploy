"use client";

import LinkCustom from "@/components/shared/link-custom";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { m } from "motion/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import IconBarrel from "@/components/shared/icons/icon-barrel";
import IconShoppingBag from "@/components/shared/icons/icon-shopping-bag";
import IconTag from "@/components/shared/icons/icon-tag";
import IconWallet from "@/components/shared/icons/icon-wallet";
import IconStar from "@/components/shared/icons/icon-start";
import { ROUTE_PUBLIC } from "@/lib/constants";

const MENU_PROFILE = [
    {
        title: "Portfolio",
        href: `${ROUTE_PUBLIC.PROFILE}/portfolio`,
        Icon: IconBarrel,
    },
    {
        title: "Offer",
        href: ROUTE_PUBLIC.PROFILE_OFFER,
        Icon: IconShoppingBag,
    },
    {
        title: "Listings",
        href: ROUTE_PUBLIC.PROFILE_LISTINGS,
        Icon: IconTag,
    },
    {
        title: "Payment",
        href: `${ROUTE_PUBLIC.PROFILE}/payments`,
        Icon: IconWallet,
    },
    {
        title: "Watchlist",
        href: `${ROUTE_PUBLIC.PROFILE}/watchlist`,
        Icon: IconStar,
    },
];

export default function MenuProfile({ className }: { className?: string }) {
    const pathname = usePathname();
    const [hoveredHref, setHoveredHref] = useState<string | null>(null);

    const activeItem =
        MENU_PROFILE.find((item) => pathname.includes(item.href)) ||
        MENU_PROFILE[1]; // default to Offers

    const ActiveIcon = activeItem.Icon;

    return (
        <div
            className={cn(
                "relative h-full border-r border-bd-main bg-bg-main pr-0 pt-0 tb:border-r-0 tb:px-0 tb:pt-0",
                className
            )}
        >
            <div className="sticky top-[var(--height-header)] z-[5] flex w-full flex-col bg-bg-main transition-all header-hidden:top-0 tb:static mb:-mx-[var(--padding-container)] mb:w-auto mb:border-b mb:border-bd-main mb:px-0">
                <h3 className="hidden select-none py-4 pl-[var(--padding-container)] font-reckless text-xl font-medium leading-[1] text-typo-primary dk:block">
                    Profile
                </h3>

                {/* Mobile Accordion */}
                <div className="hidden w-full mb:block">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem
                            value="profile-menu"
                            className="border-b-0"
                        >
                            <AccordionTrigger className="h-12 bg-bg-main px-4 py-0 font-semibold text-typo-primary">
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
                                    {MENU_PROFILE.map((item, index) => {
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

                {/* Desktop & Tablet Sidebar */}
                <div className="z-10 flex w-full flex-col tb:-mx-[var(--padding-container)] tb:h-[3.3125rem] tb:w-auto tb:flex-row mb:hidden">
                    {MENU_PROFILE.map((item, index) => {
                        const Icon = item.Icon;
                        const isActive = pathname.includes(item.href);
                        const isIndicatorActive = hoveredHref
                            ? hoveredHref === item.href
                            : isActive;

                        return (
                            <LinkCustom
                                href={`${item.href}`}
                                key={index}
                                className="group flex w-full cursor-pointer flex-row capitalize text-typo-primary first:border-t tb:h-full tb:border-r tb:first:border-t-0 tb:last:border-0 mb:border-0"
                            >
                                <div
                                    onMouseEnter={() =>
                                        setHoveredHref(item.href)
                                    }
                                    onMouseLeave={() => setHoveredHref(null)}
                                    className={cn(
                                        "relative flex w-full flex-row items-center gap-2 border-b border-bd-main px-6 py-4 text-typo-primary transition-all tb:h-full tb:px-5 tb:py-0",
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

                                    {/* Desktop Indicator Dot */}
                                    {isIndicatorActive && (
                                        <m.div
                                            layoutId="desktop-profile-menu-dot"
                                            className="ml-auto size-[0.375rem] shrink-0 rounded-full bg-typo-primary tb:hidden"
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 30,
                                            }}
                                        />
                                    )}

                                    {/* Tablet Indicator Dot */}
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
