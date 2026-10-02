import React from "react";

export default function IconWalletStatus({
    className,
}: {
    className?: string;
}) {
    return (
        <div
            className={`flex h-16 w-16 items-center justify-center rounded-full border border-[#918573] bg-transparent ${className || ""}`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#918573"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
        </div>
    );
}
