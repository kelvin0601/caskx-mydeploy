import React from "react";

export default function IconClose({ className }: { className?: string }) {
    return (
        <svg
            width="100%"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.8215 10.0002L3.33331 4.51205L4.51182 3.33353L10 8.82165L15.4881 3.3335L16.6666 4.51201L11.1785 10.0002L16.6666 15.4883L15.4881 16.6668L10 11.1787L4.51191 16.6668L3.3334 15.4883L8.8215 10.0002Z"
                fill="currentColor"
            />
        </svg>
    );
}
