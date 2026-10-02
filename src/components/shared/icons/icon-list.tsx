import React from "react";

export default function IconList({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 16 16"
            fill="none"
            className={className}
        >
            <path
                d="M14 8.4541H6.36359"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14 12.8184H6.36359"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14 4.09082H6.36362"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.08982 5.18182C3.63527 5.18182 4.18073 4.63636 4.18073 4.09091C4.18073 3.54545 3.63527 3 3.08982 3C2.54436 3 2 3.54545 2 4.09091C2 4.63636 2.54436 5.18182 3.08982 5.18182ZM3.08982 9.54545C3.63527 9.54545 4.18073 9 4.18073 8.45455C4.18073 7.90909 3.63527 7.36364 3.08982 7.36364C2.54436 7.36364 2 7.90909 2 8.45455C2 9 2.54436 9.54545 3.08982 9.54545ZM3.08982 13.9091C3.63527 13.9091 4.18073 13.3636 4.18073 12.8182C4.18073 12.2727 3.63527 11.7273 3.08982 11.7273C2.54436 11.7273 2 12.2727 2 12.8182C2 13.3636 2.54436 13.9091 3.08982 13.9091Z"
                fill="currentColor"
            />
        </svg>
    );
}
