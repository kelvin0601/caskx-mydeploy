import { cn } from "@/lib/utils";
import React from "react";

export default function IconLoading() {
    return (
        <div className="h-full min-h-20 w-full min-w-20">
            <div className="animate-loading relative h-full w-full">
                {Array.from({ length: 8 }).map((_, index, args) => {
                    const angle = (360 / 8) * (index - 1);
                    return (
                        <div
                            key={index}
                            className={cn("absolute delay-500")}
                            style={{
                                transform: `rotate(${angle}deg)`,
                                transformOrigin: "2.5rem 2.5rem",
                            }}
                        >
                            <div
                                style={{
                                    transform: `scaleY(${(index + 1) / args.length})`,
                                }}
                                className="absolute left-[2.5rem] top-[0.3rem] h-4 w-[0.125rem] bg-icon-main"
                            ></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
