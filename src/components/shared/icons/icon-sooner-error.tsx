import React from "react";

export const IconSoonerError = () => {
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
                stroke="hsl(var(--error))"
                strokeWidth="1.2"
            />
            <circle cx="12" cy="12" r="7.5" fill="hsl(var(--error))" />
            <path
                d="M14.5 9.5L9.5 14.5M9.5 9.5L14.5 14.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
