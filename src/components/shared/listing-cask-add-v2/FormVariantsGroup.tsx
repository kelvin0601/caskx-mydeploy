import { FormImageUpload } from "@/components/shared/form-image-upload";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CASK_KEYS, ROUTE_PUBLIC } from "@/lib/constants";
import {
    DUPLICATE_VARIANT_ID,
    NEW_VARIANT_ID,
} from "@/lib/constants/cask-variant";
import { formatNumberToDecimal, getErrorMessage, urlToFile } from "@/lib/utils";
import { caskChildFormSchema } from "@/lib/validators";
import caskServices from "@/services/cask";
import {
    CaskVariantItem,
    useCaskVariants,
} from "@/store/dashboard/CaskProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, {
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import IconCoppy from "../icons/icon-coppy";
import IconEye from "../icons/icon-eye";
import IconTrash from "../icons/icon-trash";
import {
    RowActionsDropdown,
    type TRowActionsDropdownItem,
} from "../row-actions-dropdown";
import { DistillationDateField } from "./DistillationDateField";
import { ReferencePriceField } from "./ReferencePriceField";
import { useVintageMarketActivity } from "./useVintageMarketActivity";

export type VariantFormValues = z.infer<typeof caskChildFormSchema>;

export type VariantsFormHandle = {
    onSubmit: (
        isCreatingVariant?: boolean,
        data?: Partial<CaskVariantItem>
    ) => Promise<void>;
    isSubmitting: boolean;
    formReset: () => void;
    getVariantFormState: () => VariantFormState;
};

export type VariantFormState = {
    isDirty: boolean;
    isValid: boolean;
};

export type FormVariantsGroupProps = {
    onVariantFormStateChange?: (state: VariantFormState) => void;
};

export { DUPLICATE_VARIANT_ID, NEW_VARIANT_ID };

export const FormVariantsGroup = React.forwardRef<
    VariantsFormHandle,
    FormVariantsGroupProps
>(function ({ onVariantFormStateChange }, ref) {
    const formVariantsGroupRef = useRef<HTMLFormElement>(null);
    const { id: masterIdFromParams } = useParams<{ id: string }>();
    const {
        activeVariantId,
        variants,
        isCreating,
        setIsCreating,
        updateVariantDraft,
        handleDeleteVariant,
        variantActive,
        setActiveVariantId,
        setPendingDeleteVariant,
    } = useCaskVariants();

    const {
        hasMarketActivity: activeVariantHasMarketActivity,
        tooltip: activeVariantTooltip,
    } = useVintageMarketActivity(variantActive);

    const resolvedMasterId = variantActive?.masterId ?? masterIdFromParams;
    const queryClient = useQueryClient();
    const [openDistillation, setOpenDistillation] = useState(false);
    const imageFileRef = useRef<File | null>(null);
    const defaultValues = useMemo(() => {
        const data = variants.find(
            (variant) => String(variant.id) === String(activeVariantId)
        );
        return {
            ...data,
            name: data?.vintageYear?.toString(),
            priceReference: [data?.referencePriceMin, data?.referencePriceMax],
            imageUrl: data?.imageUrl,
            vintageYear: data?.vintageYear,
            distillationDate: data?.distillationDate,
            estimatedBottleCount: data?.estimatedBottleCount,
            bottleVolume: data?.bottleVolume,
            abv: data?.abv,
            rla: data?.rla,
            ola: data?.ola,
            description: data?.description,
            tastingNotes: data?.tastingNotes,
            isListed: !!data?.isListed,
            readyToSell: !!data?.readyToSell,
        } as VariantFormValues | undefined;
    }, [activeVariantId, variants]);

    const internalForm = useForm<VariantFormValues>({
        resolver: zodResolver(caskChildFormSchema),
        defaultValues: defaultValues,
        mode: "all",
    });

    const invalidateCaskListingQuery = async () => {
        if (!resolvedMasterId) return;
        await Promise.all([
            queryClient.refetchQueries({
                queryKey: [CASK_KEYS.CASK_ADMIN_DETAIL, resolvedMasterId],
            }),
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.CASK_ADMIN_DETAIL, resolvedMasterId],
            }),
        ]);
    };

    const setInternalFormError = useCallback(
        (error: Error) => {
            if (Array.isArray(error.message)) {
                error.message.forEach((error) => {
                    const [field, ...message] = error.split(" ");
                    form.setError(field, {
                        message: error,
                    });
                });
            }
        },
        [internalForm]
    );
    const createCaskMutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            caskServices.createCask(payload),
        mutationKey: [CASK_KEYS.CASK_ADMIN_DETAIL, resolvedMasterId],
        onSuccess: async () => {
            setIsCreating(false);
            await invalidateCaskListingQuery();
            await new Promise((resolve) => setTimeout(resolve, 500));
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to create cask"));
            setInternalFormError(error as unknown as Error);
        },
    });
    const updateCaskMutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            caskServices.updateDetailCask(String(activeVariantId), payload),
        mutationKey: [CASK_KEYS.CASK_ADMIN_DETAIL, resolvedMasterId],
        // onSuccess: () => {
        //     invalidateCaskListingQuery();
        // },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to update cask"));
            setInternalFormError(error as unknown as Error);
        },
    });

    const form = internalForm;
    const { isDirty, isValid } = useFormState({ control: form.control });

    useEffect(() => {
        onVariantFormStateChange?.({ isDirty, isValid });
    }, [isDirty, isValid, onVariantFormStateChange]);

    const lastActiveVariantIdRef = useRef<string | null>(null);

    useEffect(() => {
        const currentId = activeVariantId ? String(activeVariantId) : null;
        if (!currentId) return;
        if (lastActiveVariantIdRef.current === currentId) return;

        imageFileRef.current = null;
        form.reset(defaultValues);
        lastActiveVariantIdRef.current = currentId;
    }, [activeVariantId, defaultValues, form]);

    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastDraftSignatureRef = useRef<string>("");

    useEffect(() => {
        const subscription = form.watch((values) => {
            if (!activeVariantId) return;

            const { priceReference, ...restValues } = values;
            const [referencePriceMin, referencePriceMax] = Array.isArray(
                priceReference
            )
                ? priceReference
                : [undefined, undefined];

            const draftPatch = {
                ...(restValues as Partial<CaskVariantItem>),
                referencePriceMin,
                referencePriceMax,
            };
            const signature = JSON.stringify(draftPatch);
            if (signature === lastDraftSignatureRef.current) return;
            lastDraftSignatureRef.current = signature;

            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
            syncTimeoutRef.current = setTimeout(() => {
                updateVariantDraft(String(activeVariantId), draftPatch);
            }, 180);
        });

        return () => {
            subscription.unsubscribe();
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [activeVariantId, form, updateVariantDraft]);

    const onSubmit = useCallback(
        async (
            data: VariantFormValues,
            isDuplicate?: boolean | undefined,
            dataToSubmit?: Partial<CaskVariantItem>
        ) => {
            if (!activeVariantId) return;
            const activeVariant = variants.find(
                (v) => String(v.id) === String(activeVariantId)
            );
            if (!activeVariant) return;
            const shouldCreateById =
                String(activeVariantId).includes(NEW_VARIANT_ID) ||
                String(activeVariantId).includes(DUPLICATE_VARIANT_ID);
            const isDuplicateVariant =
                String(activeVariantId).includes(DUPLICATE_VARIANT_ID);

            const priceReference = Array.isArray(data.priceReference)
                ? data.priceReference
                : [];
            const referencePriceMin = priceReference[0];
            const referencePriceMax = priceReference[1];

            let normalizedPayload: Record<string, unknown> = {
                ...data,
                masterId: String(activeVariant.masterId),
                referencePriceMin,
                referencePriceMax,
            };
            delete normalizedPayload.priceReference;

            if (dataToSubmit) {
                // merge dataToSubmit with normalizedPayload
                normalizedPayload = {
                    ...normalizedPayload,
                    ...dataToSubmit,
                };
            }

            // CREATE: send new payload (and file if available)
            if (imageFileRef.current) {
                normalizedPayload.image = imageFileRef.current;
            } else if (
                (typeof data.imageUrl === "string" &&
                    data.imageUrl?.startsWith("blob:")) ||
                (data.imageUrl?.startsWith("https://") &&
                    (isDuplicate || isDuplicateVariant))
            ) {
                const file = await urlToFile(data.imageUrl);
                if (file) normalizedPayload.image = file;
            }

            if (shouldCreateById || isCreating || isDuplicate) {
                const res =
                    await createCaskMutation.mutateAsync(normalizedPayload);

                if (isCreating) {
                    toast.success("Cask created successfully");
                } else if (isDuplicate) {
                    toast.success("Vintage duplicated successfully.");
                }
                // Ensure we activate the newly created/duplicated variant (avoid race with stale `variants`)
                if (res?.id) {
                    await invalidateCaskListingQuery();
                    setActiveVariantId(String(res.id));
                }
                return;
            }

            // UPDATE: send only changed fields
            const changedPayload: Record<string, unknown> = {};
            changedPayload.name = data.name;
            changedPayload.vintageYear = data.vintageYear;
            changedPayload.distillationDate = data.distillationDate;
            changedPayload.estimatedBottleCount = data.estimatedBottleCount;
            changedPayload.bottleVolume = data.bottleVolume;
            changedPayload.abv = data.abv;
            changedPayload.rla = data.rla;
            changedPayload.ola = data.ola;
            changedPayload.description = data.description;
            changedPayload.tastingNotes = data.tastingNotes;
            changedPayload.image = normalizedPayload.image;
            if (!normalizedPayload.image && data.imageUrl === "") {
                changedPayload.imageUrl = null;
            }
            changedPayload.isListed = data.isListed;
            changedPayload.readyToSell = data.readyToSell;
            changedPayload.referencePriceMin = referencePriceMin;
            changedPayload.referencePriceMax = referencePriceMax;

            if (Object.keys(changedPayload).length === 0) {
                toast.info("No changes detected");
                return;
            }
            await updateCaskMutation.mutateAsync(changedPayload);
        },
        [
            activeVariantId,
            createCaskMutation,
            isCreating,
            updateCaskMutation,
            variants,
        ]
    );

    useImperativeHandle(
        ref,
        () => ({
            onSubmit: async (
                isCreatingVariant?: boolean,
                dataToSubmit?: Partial<CaskVariantItem>
            ) => {
                let invalid = false;
                await form.handleSubmit(
                    (data) => onSubmit(data, isCreatingVariant, dataToSubmit),
                    (errors) => {
                        invalid = true;
                        // errors are already shown by RHF via <FormMessage />
                        console.log("errors", errors);
                    }
                )();
                if (invalid) {
                    throw new Error("VARIANT_FORM_INVALID");
                }
            },
            formReset: () => {
                form.reset(defaultValues);
            },
            getVariantFormState: () => ({
                isDirty: form.formState.isDirty,
                isValid: form.formState.isValid,
            }),
            // `true` means parent Save button should be disabled.
            isSubmitting:
                form.formState.isSubmitting ||
                createCaskMutation.isPending ||
                updateCaskMutation.isPending,
        }),
        [
            createCaskMutation.isPending,
            defaultValues,
            onSubmit,
            updateCaskMutation.isPending,
        ]
    );

    const handleDuplicate = useCallback(async () => {
        form.handleSubmit((data) => {
            return onSubmit(data, true);
        })();
    }, [form, onSubmit]);

    const handleDelete = useCallback(() => {
        if (activeVariantHasMarketActivity) return;
        if (!variantActive) return;
        setPendingDeleteVariant(variantActive);
    }, [
        activeVariantHasMarketActivity,
        setPendingDeleteVariant,
        variantActive,
    ]);

    const actions = useMemo(() => {
        const list: TRowActionsDropdownItem[] = [];

        if (
            resolvedMasterId &&
            activeVariantId &&
            !String(activeVariantId).includes(NEW_VARIANT_ID) &&
            !String(activeVariantId).includes(DUPLICATE_VARIANT_ID)
        ) {
            list.push({
                label: "View",
                icon: (
                    <div className="h-4 w-4">
                        <IconEye />
                    </div>
                ),
                onClick: () => {
                    window.open(
                        `${ROUTE_PUBLIC.CASK_DETAILS}/${resolvedMasterId}?active=${activeVariantId}`,
                        "_blank",
                        "noopener,noreferrer"
                    );
                },
            });
        }

        list.push(
            {
                label: createCaskMutation.isPending
                    ? "Duplicating..."
                    : "Duplicate",
                icon: (
                    <div className="h-4 w-4">
                        <IconCoppy />
                    </div>
                ),
                isDisabled: createCaskMutation.isPending,
                onClick: handleDuplicate,
            },
            {
                label: "Delete",
                icon: <IconTrash />,
                isDisabled: activeVariantHasMarketActivity,
                tooltip: activeVariantTooltip,
                onClick: handleDelete,
            }
        );

        return list;
    }, [
        resolvedMasterId,
        activeVariantId,
        handleDuplicate,
        createCaskMutation.isPending,
        activeVariantHasMarketActivity,
        activeVariantTooltip,
        handleDelete,
    ]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit((data) => onSubmit(data))}
                ref={formVariantsGroupRef}
            >
                <div className="flex flex-col gap-6 p-8 tb:p-6 mb:p-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <div className="hidden">
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                </FormItem>
                            </div>
                        )}
                    />

                    {/* 1. Basic Information */}
                    <div className="flex flex-col gap-6 bg-bg-sf4 p-6 mb:p-4">
                        <div className="flex items-start justify-between gap-4">
                            <h4 className="text-base font-semibold leading-[1.5] text-typo-primary">
                                Basic Information
                            </h4>
                            {activeVariantId &&
                                !String(activeVariantId).includes(
                                    NEW_VARIANT_ID
                                ) && <RowActionsDropdown items={actions} />}
                        </div>
                        <div className="grid grid-cols-2 !gap-x-2 gap-y-4 tb:grid-cols-1">
                            <FormField
                                control={form.control}
                                name="vintageYear"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel required>
                                            Vintage Year
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                required
                                                placeholder="2004"
                                                value={field.value ?? ""}
                                                onChange={(e) => (
                                                    field.onChange(
                                                        e.target.value === ""
                                                            ? undefined
                                                            : Number(
                                                                  e.target.value
                                                              )
                                                    ),
                                                    form.setValue(
                                                        "name",
                                                        e.target.value.toString()
                                                    )
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="distillationDate"
                                render={({ field }) => (
                                    <DistillationDateField
                                        form={form}
                                        field={field}
                                        open={openDistillation}
                                        setOpen={setOpenDistillation}
                                    />
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 space-y-1.5 tb:col-span-1">
                                        <FormLabel required>
                                            Vintage Description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                required
                                                className="min-h-[80px] w-full"
                                                placeholder="Describe this vintage — its character, maturation history, or notable characteristics…"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tastingNotes"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 space-y-1.5 tb:col-span-1">
                                        <FormLabel className="flex flex-row items-center gap-2">
                                            Tasting Note
                                            {/* <CustomTooltip
                                                childClass="bottom-[calc(100%+0.5rem)]"
                                                content="Each bullet point creates a separate note"
                                            >
                                                <div className="size-4">
                                                    <IconHelp />
                                                </div>
                                            </CustomTooltip> */}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="min-h-[80px] w-full"
                                                placeholder="Describe this vintage — its character, maturation history, or notable characteristics…"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 space-y-1.5 tb:col-span-1">
                                        <FormImageUpload
                                            key={String(activeVariantId ?? "")}
                                            label="Image"
                                            classNameImageUpload="aspect-square size-[180px] max-w-full"
                                            required
                                            form={form}
                                            fieldName="imageUrl"
                                            accept={{
                                                "image/*": [".png", ".jpg"],
                                            }}
                                            appearance="general-information"
                                            helperText=".png or .jpg only (max 5MB)"
                                            placeholder="Click to upload"
                                            defaultValue={
                                                defaultValues?.imageUrl
                                                    ? [
                                                          defaultValues.imageUrl as string,
                                                      ]
                                                    : undefined
                                            }
                                            onValueChange={(
                                                files: File[] | null
                                            ) => {
                                                if (files?.length) {
                                                    imageFileRef.current =
                                                        files[0];
                                                    field.onChange(
                                                        URL.createObjectURL(
                                                            files[0]
                                                        )
                                                    );
                                                } else {
                                                    imageFileRef.current = null;
                                                    field.onChange("");
                                                }
                                            }}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Status & Ready to sell */}
                            <div className="col-span-2 flex flex-col gap-1.5 tb:col-span-1">
                                <FormLabel required>Status</FormLabel>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                    <FormField
                                        control={form.control}
                                        name="isListed"
                                        render={({ field }) => (
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                                <span className="text-sm font-normal text-typo-primary">
                                                    Active
                                                </span>
                                            </div>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="readyToSell"
                                        render={({ field }) => (
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                                <span className="text-sm font-normal text-typo-primary">
                                                    Ready to sell
                                                </span>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Technical Specifications */}
                    <div className="flex flex-col gap-6 bg-bg-sf4 p-6 mb:p-4">
                        <h4 className="text-base font-semibold leading-[1.5] text-typo-primary">
                            Technical Specifications
                        </h4>
                        <div className="grid grid-cols-2 !gap-x-2 gap-y-4 tb:grid-cols-1">
                            <FormField
                                control={form.control}
                                name="estimatedBottleCount"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel>
                                            Estimated Bottle Count
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="420"
                                                value={field.value ?? ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === ""
                                                            ? undefined
                                                            : Number(
                                                                  e.target.value
                                                              )
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bottleVolume"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel>
                                            Bottle Volume (ml)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                placeholder="700"
                                                value={field.value ?? ""}
                                                onKeyDown={(e) => {
                                                    if (e.key === "-") {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;
                                                    if (value === "") {
                                                        field.onChange(
                                                            undefined
                                                        );
                                                        return;
                                                    }
                                                    const numericValue =
                                                        Number(value);
                                                    if (numericValue >= 0) {
                                                        field.onChange(
                                                            numericValue
                                                        );
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="abv"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel>ABV (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="59.2"
                                                {...field}
                                                value={formatNumberToDecimal(
                                                    field.value?.toString()
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rla"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel>RLA (litres)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="310"
                                                {...field}
                                                value={formatNumberToDecimal(
                                                    field.value?.toString()
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ola"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel>OLA (litres)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="480"
                                                {...field}
                                                value={formatNumberToDecimal(
                                                    field.value?.toString()
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="tb:hidden" />
                        </div>
                    </div>

                    {/* 3. Reference Price */}
                    <div className="flex flex-col gap-6 bg-bg-sf4 p-6 mb:p-4">
                        <div className="flex flex-col gap-1">
                            <h4 className="text-base font-semibold leading-[1.5] text-typo-primary">
                                Reference Price
                            </h4>
                            <p className="text-sm text-typo-note">
                                Set the expected price range for this vintage on
                                the marketplace.
                            </p>
                        </div>
                        <FormField
                            control={form.control}
                            name="priceReference"
                            render={({ field }) => (
                                <ReferencePriceField field={field} />
                            )}
                        />
                    </div>
                </div>
            </form>
        </Form>
    );
});

FormVariantsGroup.displayName = "FormVariantsGroup";
