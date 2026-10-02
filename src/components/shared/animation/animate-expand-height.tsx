"use client";

import { m } from "motion/react";
import React from "react";

type TAnimateExpandHeightProps = {
    isOpen: boolean;
    children: React.ReactNode;
    className?: string;
};

export default function AnimateExpandHeight({
    isOpen,
    children,
    className,
}: TAnimateExpandHeightProps) {
    return (
        <m.div
            animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
            initial={false}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`overflow-hidden ${className || ""}`}
        >
            <div>{children}</div>
        </m.div>
    );
}
