import React from "react";
import IconLoading from "./icon-loading";

export default function IconPendingStatus({
    className,
}: {
    className?: string;
}) {
    return (
        <div
            className={`flex h-16 w-16 items-center justify-center ${className || ""}`}
        >
            <div className="flex h-20 w-20 origin-center scale-[0.8] items-center justify-center">
                <IconLoading />
            </div>
        </div>
    );
}
