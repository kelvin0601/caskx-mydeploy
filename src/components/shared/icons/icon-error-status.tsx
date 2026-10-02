import React from "react";

export default function IconErrorStatus({ className }: { className?: string }) {
    return (
        <div
            className={`flex h-16 w-16 items-center justify-center rounded-full border border-icon bg-transparent ${className || ""}`}
        >
            <div className="size-7 text-icon-main">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    viewBox="0 0 32 31"
                    fill="none"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.1143 15.5001L5.33325 6.9935L7.21887 5.16681L16 13.6734L24.7809 5.16675L26.6666 6.99344L17.8856 15.5001L26.6666 24.0066L24.7809 25.8333L16 17.3268L7.219 25.8333L5.33339 24.0066L14.1143 15.5001Z"
                        fill="currentColor"
                    />
                </svg>
            </div>
        </div>
    );
}
