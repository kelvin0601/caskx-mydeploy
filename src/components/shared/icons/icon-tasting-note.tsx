import React from "react";

export default function IconTastingNote({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            className={className}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.5 18.3333C2.5 18.7935 2.8731 19.1666 3.33333 19.1666H16.6667C17.1269 19.1666 17.5 18.7935 17.5 18.3333V1.66659C17.5 1.20635 17.1269 0.833252 16.6667 0.833252H3.33333C2.8731 0.833252 2.5 1.20635 2.5 1.66659V18.3333ZM15.8333 17.4999H4.16667V2.49992H15.8333V17.4999Z"
                fill="currentColor"
            />
            <path
                d="M7 10.897C7 8.76984 10.103 6 10.103 6C10.103 6 13.2061 8.76364 13.2061 10.897C13.2061 12.8752 11.6158 14 10.103 14C8.5903 14 7 12.8752 7 10.897Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10.1033 12.4485C9.47956 12.4485 8.55176 12.0354 8.55176 10.897"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
