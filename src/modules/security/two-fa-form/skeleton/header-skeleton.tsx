import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export const HeaderSkeleton = () => {
    return (
        <div className="flex flex-row items-center justify-between border-b border-bd-main pb-5">
            <div className="flex min-h-10 w-full flex-1 flex-col gap-2">
                <Skeleton className="h-8 w-[70%] rounded-md tb:h-6" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
        </div>
    );
};
