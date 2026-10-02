"use client";

import React from "react";
import { cn } from "@/lib/utils";

type TNoiseOverlayProps = {
    className?: string;
};

const NoiseOverlay: React.FC<TNoiseOverlayProps> = ({ className }) => {
    return (
        <div
            data-testid="noise-overlay"
            className={cn(
                "pointer-events-none fixed inset-0 z-[9999] h-full w-full",
                className
            )}
        >
            <div
                className="absolute"
                style={{
                    backgroundImage: `url('/images/noise-bg-2.png')`,
                    backgroundRepeat: "repeat",
                    top: "-10rem",
                    left: "-10rem",
                    width: "calc(100% + 20rem)",
                    height: "calc(100% + 20rem)",
                    opacity: 0.85,
                }}
            />
        </div>
    );
};

export default NoiseOverlay;
