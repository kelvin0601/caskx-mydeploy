"use client";

import { FormImageUpload } from "@/components/shared/form-image-upload";
import { FormItem, FormMessage } from "@/components/ui/form";
import { useCaskVariants } from "@/store/dashboard/CaskProvider";
import { caskMaster } from "@/types";
import React, { useMemo } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { VariantFormValues } from "./FormVariantsGroup";

export function VintageImageField({
    form,
    imageUploadKey,
    imageFileRef,
    field,
}: {
    form: UseFormReturn<VariantFormValues>;
    imageUploadKey: number;
    imageFileRef: React.MutableRefObject<File | null>;
    field: ControllerRenderProps<VariantFormValues, "imageUrl">;
}) {
    const { activeVariantId, variants } = useCaskVariants();
    const variant = useMemo(() => {
        return variants.find(
            (variant) => variant.id === activeVariantId
        ) as Partial<caskMaster.TCaskChild>;
    }, [activeVariantId, variants]);
    return (
        <>
            <div className="flex size-full flex-row items-center gap-4">
                <FormItem>
                    <FormImageUpload
                        key={imageUploadKey}
                        label=""
                        required
                        size="small"
                        form={form}
                        fieldName="imageUrl"
                        accept={{
                            "image/*": [".png", ".jpg"],
                        }}
                        className="relative cursor-pointer after:pointer-events-none after:absolute after:bottom-0 after:right-0 after:top-0 after:h-full after:w-full after:rounded-lg after:bg-[#22262A80] after:opacity-0 after:transition-opacity after:content-[''] hover:after:opacity-100"
                        defaultValue={
                            variant?.imageUrl ? [variant.imageUrl] : undefined
                        }
                        helperText=""
                        placeholder=""
                        onValueChange={(files: File[] | null) => {
                            if (files?.length) {
                                imageFileRef.current = files[0];
                                field.onChange(URL.createObjectURL(files[0]));
                            } else {
                                imageFileRef.current = null;
                                field.onChange("");
                            }
                        }}
                    />
                </FormItem>

                <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium">
                        {variant?.vintageYear ?? "New vintage"}
                    </div>
                    <div className="text-sm text-typo-note">
                        {variant?.master?.name}
                    </div>
                </div>
            </div>
            <FormMessage className="!mt-2" />
        </>
    );
}
