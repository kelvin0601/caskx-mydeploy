import ImagePlaceholder from "@/components/shared/image-placeholder";
import LinkCustom from "@/components/shared/link-custom";
import { Button } from "@/components/ui/button";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import React from "react";

export default function EmptyData({
    title,
    description,
    className,
}: {
    title: string;
    description: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "my-[3.75rem] flex flex-col items-center gap-6",
                className
            )}
        >
            <div className="aspect-[220/178] w-[13.75rem] tb:w-[10rem] mb:w-[8rem]">
                <ImagePlaceholder
                    width={220}
                    height={178}
                    alt="Empty Data"
                    src={"/images/empty_manage_cask.png"}
                />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-lg font-semibold text-typo-primary">
                    {title}
                </div>
                <div className="max-w-[26.5rem] text-sm text-typo-soft">
                    {description}
                </div>
            </div>
            <LinkCustom href={ROUTE_PUBLIC.HOME}>
                <Button variant="secondary" className="w-full">
                    Start investing
                </Button>
            </LinkCustom>
        </div>
    );
}
