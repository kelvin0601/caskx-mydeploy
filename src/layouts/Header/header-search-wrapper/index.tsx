import ClipPathTransition from "@/components/shared/animation/clip-path-transition";
import { cn } from "@/lib/utils";
import React from "react";

export function HeaderSearchWrapper({
    isOpen,
    isMobile,
    children,
}: {
    isOpen: boolean;
    isMobile?: boolean;
    children: React.ReactNode;
}) {
    return (
        <ClipPathTransition
            isOpen={isOpen}
            disableAnimation={!isMobile}
            unmountOnExit={isMobile}
            className={cn(
                "ml-auto items-center justify-end gap-3 self-stretch dk:w-[18.8125rem] mb:absolute mb:inset-x-0 mb:top-[var(--height-header)] mb:z-40 mb:flex mb:bg-bg-dark-main",
                !isOpen && "pointer-events-none mb:hidden"
            )}
        >
            {children}
        </ClipPathTransition>
    );
}
