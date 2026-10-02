import { cn } from "@/lib/utils";
import React from "react";

export default function IconResendStatus({
    className,
}: {
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex size-16 items-center justify-center rounded-full border-2 border-bd-brown bg-transparent",
                className
            )}
        >
            <div className="size-8 text-icon-main">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                </svg>
            </div>
        </div>
    );
}
