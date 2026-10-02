"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { m } from "motion/react";
import { NOTIFICATION_TABS } from "@/lib/constants/notification";
import { useNotification } from "@/modules/notification-inbox/provider";

type TNotificationMenuProps = {
    className?: string;
};

export default function NotificationMenu({
    className,
}: TNotificationMenuProps) {
    const { activeTab, setActiveTab } = useNotification();
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const [accordionValue, setAccordionValue] = useState<string | undefined>(
        ""
    );

    const activeItem =
        NOTIFICATION_TABS.find((tab) => tab.key === activeTab) ||
        NOTIFICATION_TABS[0];

    const ActiveIcon = activeItem.Icon;

    return (
        <div
            className={cn(
                "h-full border-r border-bd-main bg-bg-main pr-0 pt-0 tb:border-r-0 tb:px-0 tb:pt-0",
                className
            )}
        >
            <div className="sticky top-[var(--height-header)] flex w-full flex-col transition-all header-hidden:top-0 tb:static mb:w-full">
                {/* Title */}
                <div className="border-b border-bd-main px-6 py-4 tb:hidden">
                    <h3 className="font-reckless text-xl font-medium leading-none text-typo-primary">
                        Notifications
                    </h3>
                </div>

                {/* Mobile: Accordion dropdown tabs */}
                <div className="hidden w-full mb:block">
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full"
                        value={accordionValue}
                        onValueChange={setAccordionValue}
                    >
                        <AccordionItem
                            value="notifications-menu"
                            className="border-b-0"
                        >
                            <AccordionTrigger className="p-4 py-4 font-semibold text-typo-primary">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 shrink-0">
                                        <ActiveIcon />
                                    </div>
                                    <div className="whitespace-nowrap text-sm">
                                        {activeItem.label}
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0 pb-0">
                                <div className="flex w-full flex-col border-t border-bd-main bg-bg-main">
                                    {NOTIFICATION_TABS.map((tab) => {
                                        const Icon = tab.Icon;
                                        const isActive = activeTab === tab.key;

                                        return (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() => {
                                                    setActiveTab(tab.key);
                                                    setAccordionValue(""); // Close accordion on select
                                                }}
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
                                                        {tab.label}
                                                    </div>
                                                    {isActive && (
                                                        <div className="ml-auto size-[0.3125rem] shrink-0 rounded-full bg-typo-primary" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Desktop/Tablet: Vertical/Horizontal tabs */}
                <div className="flex w-full flex-col tb:w-auto tb:flex-row mb:hidden">
                    {NOTIFICATION_TABS.map((tab) => {
                        const Icon = tab.Icon;
                        const isActive = activeTab === tab.key;
                        const isHovered = hoveredTab === tab.key;
                        const isIndicatorActive = hoveredTab
                            ? isHovered
                            : isActive;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                className="group flex w-full cursor-pointer flex-row items-center capitalize"
                                onClick={() => setActiveTab(tab.key)}
                                onMouseEnter={() => setHoveredTab(tab.key)}
                                onMouseLeave={() => setHoveredTab(null)}
                            >
                                <div
                                    className={cn(
                                        "flex w-full flex-row items-center gap-2 border-b border-bd-main px-6 py-4 transition-all duration-200 tb:border-b-0 tb:border-r tb:px-4",
                                        isActive || isHovered
                                            ? "text-typo-primary"
                                            : "text-typo-soft hover:text-typo-primary"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-4 w-4 shrink-0 transition-colors duration-200",
                                            isActive || isHovered
                                                ? "text-typo-primary"
                                                : "text-typo-soft group-hover:text-typo-primary"
                                        )}
                                    >
                                        <Icon />
                                    </div>
                                    <div className="whitespace-nowrap text-sm font-semibold">
                                        {tab.label}
                                    </div>

                                    {/* Animated moving dot */}
                                    {isIndicatorActive && (
                                        <m.div
                                            layoutId="notification-menu-dot"
                                            className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-typo-primary"
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export const NotificationMenuSkeleton = ({
    className,
}: {
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "relative h-full border-r border-bd-main pr-0 pt-0 tb:border-r-0 tb:px-0 tb:pt-0",
                className
            )}
        >
            <div className="sticky top-[7rem] flex w-full flex-col transition-all duration-500 header-hidden:top-[2rem] tb:static tb:border-b tb:border-bd-main">
                {[...Array(5)].map((_, i) => (
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
