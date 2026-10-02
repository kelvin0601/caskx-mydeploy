"use client";

import IconStar from "@/components/shared/icons/icon-start";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DataChip from "@/components/shared/data-chip";

type TDistillerySidebarProps = {
    image?: string;
    name: string;
    isVerified?: boolean;
    region?: string;
    country?: string;
    company?: string;
    establishedYear?: string;
    summary?: string;
    description?: string;
    className?: string;
};

export default function DistillerySidebar({
    image,
    name,
    isVerified,
    region,
    country,
    company,
    establishedYear,
    summary,
    description,
    className,
}: TDistillerySidebarProps) {
    const infoGrid = [
        { label: "Region", value: region },
        { label: "Country", value: country },
        { label: "Company", value: company },
        { label: "Founding year", value: establishedYear },
    ];

    return (
        <div className={cn("flex w-full flex-col bg-white-100", className)}>
            {/* Image Container */}
            <div className="aspect-[3/2] w-full overflow-hidden tb:p-5 mb:p-4">
                <ImagePlaceholder
                    src={image || ""}
                    alt={name}
                    width={401}
                    height={267}
                    className="h-full w-full object-cover"
                    typePlaceholder="distillery"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-5 py-6 tb:gap-5 tb:px-5 tb:pb-5 tb:pt-0 mb:gap-4 mb:px-4 mb:pb-4 mb:pt-0">
                {/* Header & Summary Container */}
                <div className="flex flex-col gap-5 mb:gap-4">
                    {/* Header: Name + Badge + Fav */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="font-reckless text-xl font-medium leading-none text-typo-primary tb:leading-none mb:text-lg mb:leading-none">
                                {name}
                            </h2>
                            {isVerified && (
                                <Badge variant="success" size="xs">
                                    Verified
                                </Badge>
                            )}
                        </div>
                        <button
                            type="button"
                            className="flex size-5 items-center justify-center text-icon transition-colors hover:text-typo-primary"
                            aria-label="Add to favorites"
                        >
                            <IconStar />
                        </button>
                    </div>
                </div>

                {/* Info Grid: 2x2 */}
                <div className="grid grid-cols-2 !gap-2 tb:!gap-2">
                    {infoGrid.map((item) => (
                        <DataChip
                            key={item.label}
                            label={item.label}
                            value={item.value}
                            className="gap-1 bg-bg-sf4"
                            fallback="-"
                        />
                    ))}
                </div>

                {/* Description */}
                {description && (
                    <div className="flex flex-col gap-3 mb:gap-3">
                        <div
                            className={cn(
                                "text-sm font-normal text-typo-sub [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>p]:my-3"
                            )}
                            dangerouslySetInnerHTML={{
                                __html: description,
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
