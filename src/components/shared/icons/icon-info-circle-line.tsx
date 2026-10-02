import React from "react";

export default function IconInfoCircleLine({
    className,
}: {
    className?: string;
}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            className={className}
        >
            <g clipPath="url(#clip0_3926_129540)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.99967 2.49992C5.85754 2.49992 2.49967 5.85778 2.49967 9.99992C2.49967 14.1421 5.85754 17.4999 9.99967 17.4999C14.1418 17.4999 17.4997 14.1421 17.4997 9.99992C17.4997 5.85778 14.1418 2.49992 9.99967 2.49992ZM0.833008 9.99992C0.833008 4.93731 4.93706 0.833252 9.99967 0.833252C15.0623 0.833252 19.1663 4.93731 19.1663 9.99992C19.1663 15.0625 15.0623 19.1666 9.99967 19.1666C4.93706 19.1666 0.833008 15.0625 0.833008 9.99992Z"
                    fill="currentColor"
                />
                <path
                    d="M9.16634 5.83325H10.833V7.49992H9.16634V5.83325Z"
                    fill="currentColor"
                />
                <path
                    d="M9.16634 9.16659H10.833V14.1666H9.16634V9.16659Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath id="clip0_3926_129540">
                    <rect width="20" height="20" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}
