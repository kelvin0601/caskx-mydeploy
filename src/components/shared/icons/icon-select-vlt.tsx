import React from "react";
import { cn } from "@/lib/utils";

type TIconSelectVltProps = {
    state?: "none" | "asc" | "desc";
};

export default function IconSelectVlt({ state = "none" }: TIconSelectVltProps) {
    const topColorClass =
        state === "asc"
            ? "text-typo-primary dark:text-typo-dark-primary"
            : "text-typo-note dark:text-typo-dark-note";

    const bottomColorClass =
        state === "desc"
            ? "text-typo-primary dark:text-typo-dark-primary"
            : "text-typo-note dark:text-typo-dark-note";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox="0 0 10 10"
            fill="none"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.98581 3.0943L3.61209 1.79915V9.16699H2.77876V1.79915L1.40504 3.0943L0.833374 2.48796L2.90959 0.530489C3.0701 0.37916 3.32075 0.37916 3.48125 0.530489L5.55747 2.48796L4.98581 3.0943Z"
                fill="currentColor"
                className={cn("transition-colors duration-200", topColorClass)}
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.16673 7.51204L7.09051 9.46951C6.93 9.62084 6.67936 9.62084 6.51885 9.46951L4.44263 7.51204L5.01429 6.9057L6.38801 8.20085V0.833008H7.22134V8.20085L8.59507 6.9057L9.16673 7.51204Z"
                fill="currentColor"
                className={cn(
                    "transition-colors duration-200",
                    bottomColorClass
                )}
            />
        </svg>
    );
}
