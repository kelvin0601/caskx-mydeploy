"use client";

import { Command, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CASK_KEYS } from "@/lib/constants";
import caskMasterServices from "@/services/cask-master";
import {
    CaskVariantItem,
    useCaskVariants,
} from "@/store/dashboard/CaskProvider";
import { caskMaster } from "@/types";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    type Modifier,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRef } from "react";
import { Command as CommandPrimitive } from "cmdk";
import {
    DUPLICATE_VARIANT_ID,
    NEW_VARIANT_ID,
} from "@/lib/constants/cask-variant";
import { SortableItem } from "./SortableItem";

const restrictToVerticalContainer: Modifier = ({
    transform,
    activeNodeRect,
    containerNodeRect,
}) => {
    if (!activeNodeRect || !containerNodeRect) {
        return { ...transform, x: 0 };
    }

    const minY = containerNodeRect.top - activeNodeRect.top;
    const maxY = containerNodeRect.bottom - activeNodeRect.bottom;

    return {
        ...transform,
        x: 0,
        y: Math.min(Math.max(transform.y, minY), maxY),
    };
};

export const VariantsGroup = ({ masterId }: { masterId?: string }) => {
    const { id: idFromParams } = useParams<{ id: string }>();
    const variantsGroupRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const {
        variants,
        activeVariantId: activeItem,
        setActiveVariantId: setActiveItem,
        reorderVariants,
        setIsCreating,
    } = useCaskVariants();
    const effectiveMasterId = masterId ?? idFromParams;

    const reorderCasksMutation = useMutation({
        mutationFn: (data: caskMaster.TReorderCasksInput) => {
            return caskMasterServices.reorderCasks(effectiveMasterId, data);
        },
        mutationKey: [CASK_KEYS.REORDER_CASKS, effectiveMasterId],
    });
    const sensors = useSensors(
        useSensor(PointerSensor, {
            onActivation: ({ event }: { event: Event }) => {
                const target = (event.target as HTMLElement).closest(
                    "[data-variant-id]"
                ) as HTMLElement;
                if (target) {
                    const isNewVariant =
                        target.dataset.variantId?.includes(NEW_VARIANT_ID) ||
                        target.dataset.variantId?.includes(
                            DUPLICATE_VARIANT_ID
                        );
                    setActiveItem(target.dataset.variantId as string);
                    setIsCreating(!!isNewVariant);
                }
            },
        })
    );
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const variantIds = variants.reduce(
            (rec: string[], variant: CaskVariantItem) => {
                if (
                    variant.id &&
                    variant.id !== NEW_VARIANT_ID &&
                    variant.id !== DUPLICATE_VARIANT_ID
                ) {
                    rec.push(variant.id);
                }
                return rec;
            },
            [] as string[]
        );

        const oldIndex = variantIds.indexOf(String(active.id));
        const newIndex = variantIds.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        const reorderedCaskIds = arrayMove(variantIds, oldIndex, newIndex);
        reorderVariants(active.id as string, over.id as string);

        reorderCasksMutation.mutate(
            { caskIds: reorderedCaskIds },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: [CASK_KEYS.LISTING, effectiveMasterId],
                    });
                },
            }
        );
    }

    return (
        <TooltipProvider delayDuration={150}>
            <div className="relative flex min-h-full flex-col">
                <Command className="w-full overflow-visible rounded-none bg-bg-main text-typo-primary">
                    <CommandPrimitive.List className="min-w-0 overflow-visible">
                        <CommandEmpty className="px-8 py-4 text-start">
                            No vintages found.
                        </CommandEmpty>
                        <CommandGroup ref={variantsGroupRef}>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                modifiers={[restrictToVerticalContainer]}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={variants.map((item) => item.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {variants?.map((variant) => {
                                        return (
                                            <SortableItem
                                                key={`${variant.id}`}
                                                variant={variant}
                                                isActive={
                                                    activeItem !== null &&
                                                    String(activeItem) ===
                                                        String(variant.id)
                                                }
                                            />
                                        );
                                    })}
                                </SortableContext>
                            </DndContext>
                        </CommandGroup>
                    </CommandPrimitive.List>
                </Command>
            </div>
        </TooltipProvider>
    );
};
