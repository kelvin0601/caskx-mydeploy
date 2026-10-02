import React from "react";

export default function IconFilterLines({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 20 20"
            fill="none"
        >
            <path
                d="M2.5 5.83333H17.5M5 10H15M8.33333 14.1667H11.6667"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
