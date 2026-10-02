import React from "react";

export default function IconChevonLeftDouble({
    className,
}: {
    className?: string;
}) {
    return (
        <svg
            className={className}
            width="100%"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3214 5L9.91058 9.41081C9.58514 9.73624 9.58514 10.2639 9.91058 10.5893L14.3214 15.0001L15.4999 13.8216L11.6783 10.0001L15.4999 6.17851L14.3214 5Z"
                fill="currentColor"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.3214 5L5.5 8.82149L4.32149 10.0001L5.5 11.1786L9.3214 15.0001L10.4999 13.8216L6.67835 10.0001L10.4999 6.17851L9.3214 5Z"
                fill="currentColor"
            />
        </svg>
    );
}
