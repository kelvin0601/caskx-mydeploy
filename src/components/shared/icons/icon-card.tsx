import React from "react";

export default function IconCard(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 32 32"
            fill="none"
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.33398 6.66634C1.33398 5.92996 1.93094 5.33301 2.66732 5.33301H29.334C30.0704 5.33301 30.6673 5.92996 30.6673 6.66634L30.6673 25.333C30.6673 25.6866 30.5268 26.0258 30.2768 26.2758C30.0267 26.5259 29.6876 26.6663 29.334 26.6663H2.66732C1.93094 26.6663 1.33398 26.0694 1.33398 25.333V6.66634ZM4.00065 7.99967V11.333H28.0006V7.99967H4.00065ZM28.0006 13.9997H4.00065V23.9997H28.0007L28.0006 13.9997ZM13.334 19.9997H6.66732V17.333H13.334V19.9997Z"
                fill="currentColor"
            />
        </svg>
    );
}
