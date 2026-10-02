import React from "react";

export const IconSoonerCheck = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                cx="12"
                cy="12"
                r="11"
                stroke="hsl(var(--success))"
                strokeWidth="1.2"
            />
            <circle cx="12" cy="12" r="7.5" fill="hsl(var(--success))" />
            <path
                d="M9.5 12L11 13.5L14.5 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
