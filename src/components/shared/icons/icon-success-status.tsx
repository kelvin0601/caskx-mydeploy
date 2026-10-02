import React from "react";

export default function IconSuccessStatus({
    className,
}: {
    className?: string;
}) {
    return (
        <div
            className={`flex h-16 w-16 items-center justify-center rounded-full border border-[#918573] bg-transparent ${className || ""}`}
        >
            <div className="size-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#058134"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
        </div>
    );
}
