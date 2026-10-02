import React from "react";

export default function IconChart({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M23 6L13.5 15.5L8.5 10.5L1 18M23 6H17M23 6V12"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
