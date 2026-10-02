import React from "react";

type TIconProps = {
    className?: string;
};

export default function IconSwitchVertical({ className }: TIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <path
                d="M3 16L7 20L11 16M7 20V4M21 8L17 4L13 8M17 4V20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
