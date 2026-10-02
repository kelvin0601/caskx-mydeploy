"use client";

import { useEffect, useState } from "react";

export default function GridOverlay() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.shiftKey && e.key === "G") {
                setVisible((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (!visible) return null;

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[9999]"
        >
            {/* Container matching site's layout */}
            <div className="container mx-auto h-full">
                {/* 12 cols on dk, 8 on tb, 4 on mb */}
                <div
                    className="grid h-full dk:grid-cols-16 tb:grid-cols-12 mb:grid-cols-4"
                    style={{ gap: "var(--gap-x)" }}
                >
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div
                            key={i}
                            className={[
                                "h-full bg-[hsl(200_100%_50%/0.08)] outline outline-1 outline-[hsl(200_100%_50%/0.25)]",
                                // hide cols 5-8 on mobile (only 4 cols)
                                i >= 4 ? "mb:hidden" : "",
                                // hide cols 9-12 on tablet (only 8 cols)
                                i >= 12 ? "tb:hidden" : "",
                            ]
                                .join(" ")
                                .trim()}
                        />
                    ))}
                </div>
            </div>

            {/* Label */}
            <div className="font-mono text-white absolute bottom-4 right-4 rounded bg-[hsl(200_100%_50%/0.9)] px-2 py-0.5 text-[0.625rem]">
                <span className="dk:hidden tb:hidden mb:block">4 cols</span>
                <span className="hidden dk:hidden tb:block mb:hidden">
                    12 cols
                </span>
                <span className="hidden dk:block tb:hidden mb:hidden">
                    16 cols
                </span>
                <span className="ml-1 opacity-60">Shift+G</span>
            </div>
        </div>
    );
}
