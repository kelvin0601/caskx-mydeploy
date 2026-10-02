"use client";

import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { HeaderStatsDesktop } from "./header-stats-desktop";
import { HeaderStatsMobile } from "./header-stats-mobile";

type THeaderStatsClientProps = {
    session: Session | null;
};

export default function HeaderStatsClient({
    session,
}: THeaderStatsClientProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const updateHeaderHeight = () => {
        // Wait for next animation frame/DOM update
        requestAnimationFrame(() => {
            const headerEl = document.querySelector("header");
            if (headerEl) {
                document.documentElement.style.setProperty(
                    "--height-header",
                    `${headerEl.clientHeight}px`
                );
            }
        });
    };

    const toggleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    // Update header height whenever expansion state changes
    useEffect(() => {
        updateHeaderHeight();
        // Fallback check after transition ends
        const timer = setTimeout(updateHeaderHeight, 350);
        return () => clearTimeout(timer);
    }, [isExpanded]);

    if (!session) return null;

    return (
        <div className="w-full border-b border-bd-main bg-bg-main backdrop-blur-[5px] tb:h-auto mb:absolute mb:top-[var(--height-header)] mb:z-[21]">
            <div className="container mx-auto h-full">
                <HeaderStatsDesktop session={session} />
                <HeaderStatsMobile
                    isExpanded={isExpanded}
                    toggleExpand={toggleExpand}
                />
            </div>
        </div>
    );
}
