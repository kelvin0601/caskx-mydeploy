import React from "react";

export default function IconStar({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 17 16"
            fill="none"
            className={className}
        >
            <path
                d="M8.1499 0.867004L10.4679 5.563L15.6499 6.316L11.8999 9.971L12.7849 15.133L8.1499 12.696L3.5149 15.133L4.3999 9.971L0.649902 6.316L5.8319 5.563L8.1499 0.867004Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
