"use client";

import { useEffect, useRef, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { TTableOfContentProps } from "../types";

type TTocItem = {
    id: string;
    label: string;
};

const RESPONSIVE_ACCORDION_ANIMATION_MS = 200;

export default function TableOfContent({
    className,
    ...rest
}: TTableOfContentProps) {
    const [tocItems, setTocItems] = useState<TTocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [indicatorOffset, setIndicatorOffset] = useState<number | null>(null);
    const [responsiveAccordionValue, setResponsiveAccordionValue] =
        useState("");
    const navRef = useRef<HTMLElement>(null);
    const responsiveScrollTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const headings = document.querySelectorAll<HTMLElement>(
            ".rich-text-content h2"
        );
        const items = Array.from(headings, (heading, index) => {
            const id = heading.id || `heading-${index}`;
            heading.id = id;

            return {
                id,
                label: (heading.textContent || "").replace(/^\d+\.\s*/, ""),
            };
        });

        setTocItems(items);
        setActiveId((currentId) => currentId || items[0]?.id || "");
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const headings = document.querySelectorAll<HTMLElement>(
                ".rich-text-content h2"
            );

            if (headings.length === 0) return;

            const headerHeight = Number.parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue(
                    "--height-header"
                )
            );
            const offset = (Number.isNaN(headerHeight) ? 0 : headerHeight) + 24;
            let current = headings[0].id;

            for (const heading of headings) {
                if (heading.getBoundingClientRect().top <= offset) {
                    current = heading.id;
                } else {
                    break;
                }
            }

            setActiveId((currentId) =>
                currentId === current ? currentId : current
            );
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [tocItems]);

    useEffect(() => {
        const navigation = navRef.current;
        if (!navigation) return;

        const updateIndicatorOffset = () => {
            const activeItem = navigation.querySelector<HTMLButtonElement>(
                '[aria-current="location"]'
            );

            setIndicatorOffset(
                activeItem
                    ? activeItem.offsetTop + activeItem.offsetHeight / 2 - 3
                    : null
            );
        };

        updateIndicatorOffset();

        const resizeObserver = new ResizeObserver(updateIndicatorOffset);
        resizeObserver.observe(navigation);

        return () => resizeObserver.disconnect();
    }, [activeId, tocItems]);

    useEffect(
        () => () => {
            if (responsiveScrollTimeoutRef.current !== null) {
                window.clearTimeout(responsiveScrollTimeoutRef.current);
            }
        },
        []
    );

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const scrollToResponsiveSection = (sectionId: string) => {
        setResponsiveAccordionValue("");

        if (responsiveScrollTimeoutRef.current !== null) {
            window.clearTimeout(responsiveScrollTimeoutRef.current);
        }

        responsiveScrollTimeoutRef.current = window.setTimeout(() => {
            scrollToSection(sectionId);
            responsiveScrollTimeoutRef.current = null;
        }, RESPONSIVE_ACCORDION_ANIMATION_MS);
    };

    const activeItem =
        tocItems.find((item) => item.id === activeId) || tocItems[0];

    return (
        <div {...rest} className={cn(className)}>
            <div className="sticky top-[var(--height-header)] flex max-h-[calc(100vh-var(--height-header))] w-auto flex-col overflow-y-auto bg-bg-main dk:-ml-[var(--padding-container)] tb:hidden">
                <div className="border-b border-bd-main px-6 py-4 mb:px-4">
                    <h2 className="font-reckless text-xl font-medium text-typo-primary">
                        Table of Contents
                    </h2>
                </div>

                <nav ref={navRef} className="relative flex flex-col">
                    <span
                        aria-hidden="true"
                        className={cn(
                            "pointer-events-none absolute right-6 top-0 z-10 size-1.5 rounded-full bg-typo-primary transition-[transform,opacity] duration-300 ease-out mb:right-4",
                            indicatorOffset === null
                                ? "opacity-0"
                                : "opacity-100"
                        )}
                        style={{
                            transform: `translateY(${indicatorOffset ?? 0}px)`,
                        }}
                    />
                    {tocItems.map((item) => {
                        const isActive = activeId === item.id;
                        return (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                aria-current={isActive ? "location" : undefined}
                                className={cn(
                                    "flex min-h-[3.3125rem] cursor-pointer items-center justify-between gap-3 border-b border-bd-main px-6 py-4 text-left outline-none transition-colors focus-visible:bg-bg-sf1 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bd-brown mb:px-4",
                                    isActive
                                        ? "text-typo-primary"
                                        : "text-typo-soft hover:text-typo-primary"
                                )}
                            >
                                <span className="min-w-0 flex-1 break-words text-sm font-semibold">
                                    {item.label}
                                </span>
                                <span className="size-1.5 shrink-0" />
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="relative hidden px-5 tb:block tb:px-0">
                <div className="flex flex-col gap-1 pt-4">
                    <p className="text-xs font-normal text-typo-soft">
                        Table of Contents
                    </p>
                    <Accordion
                        type="single"
                        collapsible
                        value={responsiveAccordionValue}
                        onValueChange={setResponsiveAccordionValue}
                        className="w-full"
                    >
                        <AccordionItem
                            value="responsive-terms-table-of-contents"
                            className="border-none"
                        >
                            <AccordionTrigger className="relative gap-2 p-0 pb-4 text-left text-sm font-semibold capitalize text-typo-primary outline-none after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-bd-main focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bd-brown">
                                <span className="min-w-0 flex-1 break-words">
                                    {activeItem?.label || "Select a section"}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="p-0 pb-0">
                                <nav
                                    aria-label="Table of Contents"
                                    className="flex w-full flex-col border-x border-b border-bd-main bg-bg-main shadow-[0px_0.5rem_1.5rem_0px_rgba(0,0,0,0.08)]"
                                >
                                    {tocItems.map((item) => {
                                        const isActive = activeId === item.id;

                                        return (
                                            <button
                                                type="button"
                                                key={item.id}
                                                onClick={() =>
                                                    scrollToResponsiveSection(
                                                        item.id
                                                    )
                                                }
                                                aria-current={
                                                    isActive
                                                        ? "location"
                                                        : undefined
                                                }
                                                className={cn(
                                                    "flex min-h-12 w-full items-center gap-3 border-b border-bd-main px-4 py-3 text-left text-sm font-medium capitalize outline-none transition-colors last:border-b-0 hover:bg-bg-sf1 hover:text-typo-primary focus-visible:bg-bg-sf1 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bd-brown",
                                                    isActive
                                                        ? "text-typo-primary"
                                                        : "text-typo-soft"
                                                )}
                                            >
                                                <span className="min-w-0 flex-1 break-words">
                                                    {item.label}
                                                </span>
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        "size-1 shrink-0 rounded-full bg-typo-primary",
                                                        isActive
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                            </button>
                                        );
                                    })}
                                </nav>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    );
}
