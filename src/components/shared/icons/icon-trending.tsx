import React from "react";

export default function IconTrending({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 16 16"
            fill="none"
            className={className}
        >
            <g clipPath="url(#clip0_1062_83153)">
                <path
                    d="M14.5 0.5H1.5C0.947715 0.5 0.5 0.947715 0.5 1.5V14.5C0.5 15.0523 0.947715 15.5 1.5 15.5H14.5C15.0523 15.5 15.5 15.0523 15.5 14.5V1.5C15.5 0.947715 15.0523 0.5 14.5 0.5Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M2.5 9.5L5.5 6.5L9.5 10.5L13.5 6.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
            <defs>
                <clipPath id="clip0_1062_83153">
                    <rect width="16" height="16" fill="currentColor" />
                </clipPath>
            </defs>
        </svg>
    );
}
