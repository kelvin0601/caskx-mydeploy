"use client";

import { m, AnimatePresence, Variants } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";

type TClipPathTransitionProps = {
    children: React.ReactNode;
    isOpen: boolean;
    className?: string;
    duration?: number;
    unmountOnExit?: boolean;
    disableAnimation?: boolean;
};

export default function ClipPathTransition({
    children,
    isOpen,
    className,
    duration = 0.3,
    unmountOnExit = false,
    disableAnimation = false,
}: TClipPathTransitionProps) {
    const variants: Variants = {
        open: {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            transition: { duration, ease: "easeOut" },
        },
        closed: {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            transition: { duration, ease: "easeOut" },
        },
    };

    if (disableAnimation) {
        return (
            <div className={cn(className, !isOpen && "pointer-events-none")}>
                {children}
            </div>
        );
    }

    if (unmountOnExit) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <m.div
                        className={className}
                        initial={isOpen ? "open" : "closed"}
                        animate="open"
                        exit="closed"
                        variants={variants}
                    >
                        {children}
                    </m.div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <m.div
            className={cn(className, !isOpen && "pointer-events-none")}
            initial={isOpen ? "open" : "closed"}
            animate={isOpen ? "open" : "closed"}
            variants={variants}
        >
            {children}
        </m.div>
    );
}
