import React from "react";

export const IconSoonerWarning = () => {
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
                stroke="hsl(var(--warn))"
                strokeWidth="1.2"
            />
            <circle cx="12" cy="12" r="7.5" fill="hsl(var(--warn))" />
            <path
                d="M12 8V13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle cx="12" cy="15.5" r="0.75" fill="currentColor" />
        </svg>
    );
};
