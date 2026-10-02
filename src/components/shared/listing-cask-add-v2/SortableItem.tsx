"use client";

import { CommandItem } from "@/components/ui/command";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
    CaskVariantItem,
    isPendingVariant,
    useCaskVariants,
} from "@/store/dashboard/CaskProvider";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import IconCoppy from "../icons/icon-coppy";
import IconsDrag from "../icons/icons-drag";
import IconTrash from "../icons/icon-trash";
import { NEW_VARIANT_ID } from "@/lib/constants/cask-variant";
import {
    useVintageMarketActivity,
    VINTAGE_HAS_MARKET_ACTIVITY_TOOLTIP,
} from "./useVintageMarketActivity";
import { VintageItem } from "./VintageItem";

export function SortableItem({
    variant,
    isActive,
}: {
    variant: CaskVariantItem;
    isActive: boolean;
}) {
    const id = variant.id;
    const { variants, duplicateVariant, setPendingDeleteVariant } =
        useCaskVariants();
    const { hasMarketActivity } = useVintageMarketActivity(variant);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasMarketActivity) return;
        setPendingDeleteVariant(variant);
    };

    const handleDuplicateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (variants.some(isPendingVariant)) {
            toast.error("Save cask to add new vintages");
            return;
        }
        duplicateVariant(variant);
        toast.success("Vintage duplicated successfully.");
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "group relative cursor-pointer",
                isDragging ? "relative z-20" : "[inherit]"
            )}
        >
            <div
                className="absolute left-1.5 top-1/2 z-20 size-4 -translate-y-1/2 text-icon-main opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
            >
                <IconsDrag />
            </div>

            <CommandItem
                data-variant-id={!!id ? id : `${NEW_VARIANT_ID}-${uuidv4()}`}
                className={cn(
                    "cursor-pointer rounded-none border-b border-bd-main py-4 pl-8 pr-4 text-left transition-colors hover:bg-[#F5F2EC] focus-visible:bg-[#F5F2EC] tb:pl-6 tb:pr-3 mb:py-3",
                    isActive
                        ? "border-l-2 border-l-[#0C0A09] bg-[#F5F2EC]"
                        : "border-l-2 border-l-transparent bg-bg-main"
                )}
            >
                <div className="flex w-full min-w-0 items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <VintageItem variant={variant} />
                    </div>

                    <div
                        className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 mb:opacity-100"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {hasMarketActivity ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        tabIndex={0}
                                        role="button"
                                        aria-label="Delete vintage disabled"
                                        className="flex size-6 cursor-not-allowed items-center justify-center text-icon-disable opacity-40 focus-visible:outline-none"
                                    >
                                        <span className="pointer-events-none size-4 shrink-0">
                                            <IconTrash />
                                        </span>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    sideOffset={6}
                                    className="line-clamp-none max-w-[18.75rem] whitespace-normal rounded-lg bg-bg-dark-main px-3 py-2 text-start text-xs leading-snug text-typo-dark-primary shadow-md"
                                >
                                    {VINTAGE_HAS_MARKET_ACTIVITY_TOOLTIP}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <button
                                type="button"
                                aria-label="Delete vintage"
                                className="flex size-6 items-center justify-center text-icon-main transition-colors hover:text-icon-highlight focus-visible:outline-none"
                                onClick={handleDeleteClick}
                            >
                                <span className="pointer-events-none size-4 shrink-0">
                                    <IconTrash />
                                </span>
                            </button>
                        )}

                        <button
                            type="button"
                            aria-label="Duplicate vintage"
                            className="flex size-6 items-center justify-center text-icon-main transition-colors hover:text-icon-highlight focus-visible:outline-none"
                            onClick={handleDuplicateClick}
                        >
                            <span className="pointer-events-none size-4 shrink-0">
                                <IconCoppy />
                            </span>
                        </button>
                    </div>
                </div>
            </CommandItem>
        </div>
    );
}
