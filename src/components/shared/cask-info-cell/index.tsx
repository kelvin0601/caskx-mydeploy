"use client";

import IconClipboard from "@/components/shared/icons/icon-clipboard";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import LinkCustom from "@/components/shared/link-custom";
import CustomTooltip from "@/components/shared/tooltips-custom";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { useState } from "react";

type TCaskInfoCellProps = {
    caskId: string;
    caskName?: string;
    distilleryName?: string;
    imageSrc?: string;
    imageAlt?: string;
    copyTimeout?: number;
    className?: string;
};

export default function CaskInfoCell({
    caskId,
    caskName,
    distilleryName,
    imageSrc = "/images/cask/cask_1.jpg",
    imageAlt,
    copyTimeout = 2000,
    className,
}: TCaskInfoCellProps) {
    const [copiedCaskId, setCopiedCaskId] = useState<string | null>(null);

    const handleCopyCaskId = async () => {
        try {
            await navigator.clipboard.writeText(caskId);
            setCopiedCaskId(caskId);
            // Reset the copied state after timeout
            setTimeout(() => {
                setCopiedCaskId(null);
            }, copyTimeout);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <div className={`flex flex-row items-center gap-3 ${className || ""}`}>
            <div className="h-[3.75rem] w-[3.75rem] flex-shrink-0 overflow-hidden rounded-[0.3125rem]">
                <ImagePlaceholder
                    src={imageSrc}
                    width={120}
                    height={120}
                    className="h-full w-full"
                    alt={imageAlt || caskName || "Cask image"}
                />
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex flex-row gap-2">
                    <LinkCustom
                        href={`${ROUTE_PUBLIC.CASK_DETAILS}/${caskId}`}
                        className="line-clamp-3 break-words text-sm font-medium text-typo-primary"
                    >
                        {caskName}
                    </LinkCustom>
                    <div
                        onMouseLeave={() => {
                            setCopiedCaskId(null);
                        }}
                        onClick={handleCopyCaskId}
                    >
                        <CustomTooltip
                            content={
                                copiedCaskId === caskId
                                    ? "Copied!"
                                    : "Copy cask ID"
                            }
                            childClass="group-hover:-translate-y-2 "
                        >
                            <div className="pointer-events-none h-4 w-4 text-typo-note opacity-0 transition-all group-hover/table-row:pointer-events-auto group-hover/table-row:opacity-100">
                                <IconClipboard />
                            </div>
                        </CustomTooltip>
                    </div>
                </div>
                {/* {distilleryName && (
                    <div className="text-sm text-typo-soft">
                        {distilleryName}
                    </div>
                )} */}
            </div>
        </div>
    );
}
