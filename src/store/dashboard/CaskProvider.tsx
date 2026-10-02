"use client";

import { caskMaster } from "@/types";
import { arrayMove } from "@dnd-kit/sortable";
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import {
    DUPLICATE_VARIANT_ID,
    NEW_VARIANT_ID,
} from "@/lib/constants/cask-variant";
import { v4 as uuidv4 } from "uuid";
export type CaskVariantItem = caskMaster.TCaskChild;

export { NEW_VARIANT_ID, DUPLICATE_VARIANT_ID };

type CaskVariantsContextValue = {
    variants: CaskVariantItem[];
    activeVariantId: string | null;
    isCreating: boolean;
    setIsCreating: (open: boolean) => void;
    setActiveVariantId: (id: string) => void;
    addEmptyVariant: ({ masterId }: { masterId: string }) => void;
    duplicateVariant: (variant: CaskVariantItem) => void;
    reorderVariants: (activeId: string, overId: string) => void;
    setListVariants: (variants: CaskVariantItem[]) => void;
    handleDeleteVariant: (id: string) => void;
    variantActive?: CaskVariantItem;
    updateVariantDraft: (id: string, patch: Partial<CaskVariantItem>) => void;
    pendingDeleteVariant: CaskVariantItem | null;
    setPendingDeleteVariant: (variant: CaskVariantItem | null) => void;
};

const CaskVariantsContext = createContext<CaskVariantsContextValue | null>(
    null
);

export const isPendingVariant = (variant: CaskVariantItem) => {
    const id = String(variant.id);
    return id.includes(NEW_VARIANT_ID) || id.includes(DUPLICATE_VARIANT_ID);
};

export function CaskVariantsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [listVariants, setListVariants] = useState<CaskVariantItem[]>([]);
    const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

    const variantActive = listVariants.find(
        (v) => String(v.id) === String(activeVariantId)
    );

    const [isCreating, setIsCreating] = useState(false);
    const [pendingDeleteVariant, setPendingDeleteVariant] =
        useState<CaskVariantItem | null>(null);

    const addEmptyVariant = useCallback(
        ({ masterId }: { masterId: string }) => {
            if (listVariants.some(isPendingVariant)) return;

            const newId = uuidv4();
            const emptyVariant: Partial<caskMaster.TCaskChild> = {
                id: `${NEW_VARIANT_ID}-${newId}`,
                masterId: String(masterId),
                master: undefined,
                imageUrl: "",
                vintageYear: null,
                distillationDate: "",
                estimatedBottleCount: null,
                bottleVolume: null,
                abv: null,
                rla: null,
                name: "New vintage",
                ola: null,
                priceReference: "",
                description: "",
                tastingNotes: "",
                isListed: false,
                readyToSell: false,
            };

            setListVariants((prev) => [
                ...prev,
                emptyVariant as CaskVariantItem,
            ]);
            setActiveVariantId(emptyVariant.id as string);
            setIsCreating(true);
        },
        [listVariants]
    );
    const handleDeleteVariant = useCallback((id: string) => {
        setListVariants((prev) => {
            const next = prev.filter((v) => String(v.id) !== String(id));
            setActiveVariantId((prevActiveId) => {
                if (String(prevActiveId) === String(id)) {
                    return next.length > 0 ? String(next[0].id) : null;
                }
                return prevActiveId;
            });
            return next;
        });
    }, []);

    const updateVariantDraft = useCallback(
        (id: string, patch: Partial<CaskVariantItem>) => {
            setListVariants((prev) => {
                const index = prev.findIndex(
                    (variant) => String(variant.id) === String(id)
                );
                if (index === -1) return prev;

                const current = prev[index];
                let hasChanges = false;
                for (const [key, value] of Object.entries(patch)) {
                    if ((current as Record<string, unknown>)[key] !== value) {
                        hasChanges = true;
                        break;
                    }
                }
                if (!hasChanges) return prev;

                const next = [...prev];
                next[index] = { ...current, ...patch } as CaskVariantItem;
                return next;
            });
        },
        []
    );

    const duplicateVariant = useCallback(
        (variant: CaskVariantItem) => {
            if (listVariants.some(isPendingVariant)) return;
            const duplicateId = DUPLICATE_VARIANT_ID;
            setListVariants((prev) => [
                ...prev,
                {
                    ...variant,
                    name: `${variant.name}(1)`,
                    id: duplicateId,
                },
            ]);
            setActiveVariantId(duplicateId);
            setIsCreating(true);
        },
        [listVariants]
    );

    const reorderVariants = useCallback((activeId: string, overId: string) => {
        if (activeId === overId) return;
        setListVariants((prev) => {
            const oldIndex = prev.findIndex((v) => v.id === activeId);
            const newIndex = prev.findIndex((v) => v.id === overId);
            if (oldIndex === -1 || newIndex === -1) return prev;
            return arrayMove(prev, oldIndex, newIndex);
        });
    }, []);

    const value = useMemo(
        () => ({
            variants: listVariants,
            activeVariantId,
            setActiveVariantId,
            addEmptyVariant,
            reorderVariants,
            isCreating,
            setIsCreating,
            listVariants,
            setListVariants,
            duplicateVariant,
            handleDeleteVariant,
            variantActive,
            updateVariantDraft,
            pendingDeleteVariant,
            setPendingDeleteVariant,
        }),
        [
            activeVariantId,
            addEmptyVariant,
            duplicateVariant,
            handleDeleteVariant,
            isCreating,
            listVariants,
            pendingDeleteVariant,
            reorderVariants,
            updateVariantDraft,
            variantActive,
        ]
    );

    return (
        <CaskVariantsContext.Provider value={value}>
            {children}
        </CaskVariantsContext.Provider>
    );
}

export function useCaskVariants() {
    const context = useContext(CaskVariantsContext);
    if (!context) {
        throw new Error(
            "useCaskVariants must be used inside CaskVariantsProvider"
        );
    }
    return context;
}
