"use client";

import { AddNewVintageCard } from "@/components/shared/listing-cask-add-v2/AddNewVintageCard";
import {
    FormVariantsGroup,
    type VariantFormState,
    type VariantsFormHandle,
} from "@/components/shared/listing-cask-add-v2/FormVariantsGroup";
import IconPlus from "@/components/shared/icons/icon-plus";
import { Button } from "@/components/ui/button";
import { useCaskVariants } from "@/store/dashboard/CaskProvider";
import dynamic from "next/dynamic";
import type { RefObject } from "react";
import { toast } from "sonner";
import { DeleteVintageDialog } from "./DeleteVintageDialog";
import {
    DUPLICATE_VARIANT_ID,
    NEW_VARIANT_ID,
} from "@/lib/constants/cask-variant";

const VariantsGroup = dynamic(() =>
    import("@/components/shared/listing-cask-add-v2/VariantsGroup").then(
        (module) => module.VariantsGroup
    )
);

type VintagesSectionProps = {
    variantsMasterId: string;
    variantsForm: RefObject<VariantsFormHandle | null>;
    onVariantFormStateChange: (state: VariantFormState) => void;
};

export function VintagesSection({
    variantsMasterId,
    variantsForm,
    onVariantFormStateChange,
}: VintagesSectionProps) {
    const { variants, activeVariantId, addEmptyVariant } = useCaskVariants();
    const hasActiveVariant = Boolean(activeVariantId);
    const hasPendingVintage = variants.some((variant) => {
        const id = String(variant.id);
        return id.includes(NEW_VARIANT_ID) || id.includes(DUPLICATE_VARIANT_ID);
    });

    const handleAddVintage = () => {
        if (hasPendingVintage) {
            toast.error("Save cask to add new vintages");
            return;
        }

        addEmptyVariant({ masterId: variantsMasterId });
    };

    return (
        <section className="border border-bd-main bg-bg-main">
            <header className="flex items-center justify-between gap-4 border-b border-bd-main p-8 tb:p-6 mb:flex-col mb:items-start mb:p-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="text-lg font-semibold leading-[1.2] text-typo-primary">
                        Vintage Management
                    </h3>
                    <p className="text-sm font-normal leading-[1.5] text-typo-soft">
                        Categorise this cask to help buyers discover it on the
                        marketplace.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddVintage}
                    className="h-10 shrink-0 rounded-none border border-bd-main bg-transparent px-5 py-[0.8125rem] text-sm font-medium leading-none text-typo-primary backdrop-blur-[10px] hover:bg-bg-sf4 focus-visible:bg-bg-sf4 mb:px-4"
                >
                    Add Vintage
                    <span className="size-3.5" aria-hidden="true">
                        <IconPlus />
                    </span>
                </Button>
            </header>

            {variants.length === 0 ? (
                <AddNewVintageCard onAdd={handleAddVintage} />
            ) : (
                <div className="flex min-w-0 items-stretch tb:flex-col">
                    <aside className="w-[17.375rem] shrink-0 border-r bg-bg-main tb:static tb:w-full tb:border-b tb:border-r-0">
                        <div className="sticky top-20 z-10 self-start">
                            <VariantsGroup masterId={variantsMasterId} />
                        </div>
                    </aside>
                    {hasActiveVariant && (
                        <div className="min-w-0 flex-1">
                            <FormVariantsGroup
                                ref={variantsForm}
                                onVariantFormStateChange={
                                    onVariantFormStateChange
                                }
                            />
                        </div>
                    )}
                </div>
            )}
            <DeleteVintageDialog masterId={variantsMasterId} />
        </section>
    );
}
