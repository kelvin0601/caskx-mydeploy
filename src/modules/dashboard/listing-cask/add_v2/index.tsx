"use client";
import { FormImageUpload } from "@/components/shared/form-image-upload";
import IconChevonLeft from "@/components/shared/icons/icon-chevon-left";
import {
    type VariantFormState,
    type VariantsFormHandle,
} from "@/components/shared/listing-cask-add-v2/FormVariantsGroup";
import { ListingCaskV2Header } from "@/components/shared/listing-cask-add-v2/ListingCaskV2Header";
import { VintagesSection } from "@/components/shared/listing-cask-add-v2/VintagesSection";
import { Button } from "@/components/ui/button";
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
import { VirtualizedCombobox } from "@/components/ui/virtualized-combobox";
import { setFormErrors } from "@/helpers";
import { useFormChangeDetector } from "@/hooks/useFormChangeDetector";
import { useLeavePageActionWithDiscardDialog } from "@/hooks/useLeavePageActionWithDiscardDialog";
import {
    CASK_KEYS,
    DISTILLERY_KEYS,
    FILTER_KEYS,
    PATH_CLASSIFICATION,
    PATH_META_DATA_CASK,
    PATH_REGIONS,
    ROUTE_DASHBOARD,
} from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { caskMasterFormSchema } from "@/lib/validators";
import caskServices from "@/services/cask";
import caskMasterServices from "@/services/cask-master";
import classificationsServices from "@/services/classifications";
import distilleriesServices from "@/services/distilleries";
import regionsServices from "@/services/region";
import { useCaskVariants } from "@/store/dashboard/CaskProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const PEAT_LEVEL_OPTIONS = [
    { value: "unpeated", label: "Unpeated" },
    { value: "lightly_peated", label: "Lightly peated" },
    { value: "medium_peated", label: "Medium peated" },
    { value: "heavily_peated", label: "Heavily peated" },
];

type FormValues = z.infer<typeof caskMasterFormSchema>;

const initialValues: Partial<FormValues> = {
    name: "",
    status: "active",
    distilleryId: "",
    caskTypeId: "",
    regionId: "",
    classification: "",
    peatLevels: "",
    imageUrl: "",
};

export default function CaskAddModuleV2() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const imageFileRef = useRef<File | string | null>(null);

    const variantsForm = useRef<VariantsFormHandle | null>(null);
    const [variantFormState, setVariantFormState] = useState<VariantFormState>({
        isDirty: false,
        isValid: true,
    });

    const {
        variants,
        setListVariants,
        activeVariantId,
        setActiveVariantId,
        setIsCreating,
    } = useCaskVariants();

    const [masterId, setMasterId] = useState<string | null>(null);
    const [variantsMasterId, setVariantsMasterId] = useState<string | null>(
        null
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(caskMasterFormSchema),
        defaultValues: initialValues,
    });

    const { setInitialSnapshot, hasFormChanged } =
        useFormChangeDetector<FormValues>({
            form,
            compareFields: [
                "name",
                "status",
                "distilleryId",
                "caskTypeId",
                "regionId",
                "classification",
                "peatLevels",
                "imageUrl",
            ],
        });

    const handleVariantFormStateChange = useCallback(
        (state: VariantFormState) => {
            setVariantFormState((prev) =>
                prev.isDirty === state.isDirty && prev.isValid === state.isValid
                    ? prev
                    : state
            );
        },
        []
    );

    const shouldBlockLeavePage =
        hasFormChanged || form.formState.isDirty || variantFormState.isDirty;
    const { confirmAndRun, DiscardChangesDialog } =
        useLeavePageActionWithDiscardDialog({
            shouldBlock: shouldBlockLeavePage,
        });

    const createMasterMutation = useMutation({
        mutationFn: (payload: FormValues) =>
            caskMasterServices.createCaskMaster(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.LISTING, data.id],
            });
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.LISTING_PAGE],
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to create cask"));
        },
    });
    const updateMasterMutation = useMutation({
        mutationFn: (payload: Partial<FormValues>) => {
            if (!masterId) {
                throw new Error("Missing master id");
            }
            return caskMasterServices.updateCaskMaster(
                String(masterId),
                payload
            );
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.LISTING, masterId],
            });
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.LISTING_PAGE],
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to update cask"));
        },
    });

    const mainSubmitSucceededRef = useRef(false);

    const resetPageState = useCallback(() => {
        mainSubmitSucceededRef.current = false;
        setMasterId(null);
        setVariantsMasterId(null);

        // Clear variants UI (left panel + internal form)
        setActiveVariantId("");
        setIsCreating(false);
        setListVariants([]);

        // Reset main form
        form.reset(initialValues as FormValues);
        setInitialSnapshot(initialValues as FormValues);
    }, [
        form,
        setActiveVariantId,
        setIsCreating,
        setListVariants,
        setInitialSnapshot,
    ]);

    const onMainSubmit = async (values: FormValues) => {
        if (!variantsForm.current?.getVariantFormState().isValid) {
            toast.error("Please complete the vintage details before saving.");
            return;
        }
        try {
            if (!masterId) {
                const payload = values as FormValues & { image?: File };
                if (imageFileRef.current instanceof File) {
                    payload.image = imageFileRef.current;
                }
                const created = await createMasterMutation.mutateAsync(payload);
                const newMasterId = created.id;

                setMasterId(newMasterId);
                setVariantsMasterId(newMasterId);

                // Update placeholder variant drafts with the real masterId
                setListVariants(
                    variants.map((v) => ({
                        ...v,
                        masterId: newMasterId,
                    }))
                );

                await variantsForm.current?.onSubmit?.(false, {
                    masterId: newMasterId,
                });
                resetPageState();
                queryClient.invalidateQueries({
                    queryKey: [CASK_KEYS.LISTING_PAGE],
                });

                await new Promise((resolve) => setTimeout(resolve, 500));
                router.push(`${ROUTE_DASHBOARD.CASK}/${newMasterId}`);
            }
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.LISTING_PAGE],
            });
        } catch (error) {
            setFormErrors(error, form, { capitalizeFirstLetter: false });
        }
    };

    const handleSave = async () => {
        if (variants.length === 0) {
            toast.error("Please add at least one vintage before saving.");
            return;
        }
        form.handleSubmit(onMainSubmit)();
    };

    const distilleriesQuery = useQuery({
        queryKey: [DISTILLERY_KEYS.LISTING, "add"],
        queryFn: () => distilleriesServices.getDistillery("page=1&limit=1000"),
    });
    const caskTypesQuery = useQuery({
        queryKey: [FILTER_KEYS.CASK_TYPE, "add"],
        queryFn: () => caskServices.getCaskTypes("page=1&size=1000"),
    });
    const classificationsQuery = useQuery({
        queryKey: [PATH_META_DATA_CASK, PATH_CLASSIFICATION, "add"],
        queryFn: () => classificationsServices.getClassification(),
    });
    const regionsQuery = useQuery({
        queryKey: [PATH_REGIONS, "add"],
        queryFn: () => regionsServices.getRegions(),
    });

    const distilleriesOptions = useMemo(() => {
        return (
            distilleriesQuery.data?.map((distillery) => ({
                value: distillery.id,
                label: distillery.name,
            })) || []
        );
    }, [distilleriesQuery.data]);
    const caskTypesOptions = useMemo(() => {
        return (
            caskTypesQuery.data?.caskTypes?.map((caskType) => ({
                value: caskType.id,
                label: caskType.name,
            })) || []
        );
    }, [caskTypesQuery.data]);
    const regionsOptions = useMemo(() => {
        return (
            regionsQuery.data?.map((region) => ({
                value: String(region.id),
                label: region.name,
            })) || []
        );
    }, [regionsQuery.data]);
    const classificationsOptions = useMemo(() => {
        return (
            classificationsQuery.data?.classifications?.map(
                (classification) => ({
                    value: String(classification.value),
                    label: classification.label,
                })
            ) || []
        );
    }, [classificationsQuery.data]);

    useEffect(() => {
        resetPageState();
    }, [resetPageState]);

    const watchedName = form.watch("name");
    const caskName = watchedName || "New Cask";

    return (
        <div className="relative w-full">
            <ListingCaskV2Header
                title={caskName}
                onBack={() => {
                    void confirmAndRun(() => router.push(ROUTE_DASHBOARD.CASK));
                }}
                right={
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleSave}
                        className="h-10 min-w-0 rounded-none !bg-bg-dark-main px-5 py-[0.8125rem] text-sm font-medium leading-none !text-typo-dark-primary hover:!bg-bg-dark-main focus-visible:!bg-bg-dark-main disabled:!bg-bg-sf2 disabled:!text-typo-soft mb:h-9 mb:px-3 mb:text-xs"
                        disabled={
                            createMasterMutation.isPending ||
                            updateMasterMutation.isPending ||
                            variantsForm.current?.isSubmitting ||
                            !hasFormChanged
                        }
                    >
                        {createMasterMutation.isPending ||
                        updateMasterMutation.isPending
                            ? "Saving..."
                            : "Save"}
                    </Button>
                }
            />
            <div className="w-full space-y-8 bg-bg-sf1 p-10 tb:space-y-6 tb:p-6 mb:space-y-4 mb:p-4">
                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void handleSave();
                        }}
                        className="space-y-8 tb:space-y-6 mb:space-y-4"
                    >
                        {/* 1. General Information */}
                        <div className="flex flex-col gap-4 rounded-none border border-bd-main bg-bg-main p-8 tb:p-6 mb:p-4">
                            <h3 className="text-lg font-semibold text-typo-primary mb:text-base">
                                General Information
                            </h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel required>
                                                Cask Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    required
                                                    className="text-sm"
                                                    placeholder="Glenfiddich Single Malt OB"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel required>
                                                Status
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={
                                                            field.value ===
                                                            "active"
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            field.onChange(
                                                                checked
                                                                    ? "active"
                                                                    : "inactive"
                                                            )
                                                        }
                                                    />
                                                    <span className="text-sm font-normal text-typo-primary">
                                                        {field.value ===
                                                        "active"
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormImageUpload
                                                label="Image"
                                                classNameImageUpload="aspect-square size-[180px] max-w-full"
                                                appearance="general-information"
                                                required
                                                form={form}
                                                fieldName="imageUrl"
                                                accept={{
                                                    "image/*": [".png", ".jpg"],
                                                }}
                                                helperText=".png or .jpg only (max 5MB)"
                                                placeholder="Click to upload"
                                                defaultValue={
                                                    field.value
                                                        ? [
                                                              field.value as string,
                                                          ]
                                                        : undefined
                                                }
                                                onValueChange={(files) => {
                                                    if (files?.length) {
                                                        imageFileRef.current =
                                                            files[0];
                                                        field.onChange(
                                                            URL.createObjectURL(
                                                                files[0]
                                                            )
                                                        );
                                                    } else {
                                                        imageFileRef.current =
                                                            null;
                                                        field.onChange("");
                                                    }
                                                }}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* 2. Agreement to sign / Categorisation */}
                        <div className="flex flex-col gap-4 rounded-none border border-bd-main bg-bg-main p-8 tb:p-6 mb:p-4">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-lg font-semibold text-typo-primary mb:text-base">
                                    Classification
                                </h3>
                                <p className="text-sm font-normal leading-[1.5] text-typo-soft">
                                    Categorise this cask to help buyers discover
                                    it on the marketplace.
                                </p>
                            </div>
                            <div className="flex w-full gap-2 tb:flex-col tb:gap-4">
                                <FormField
                                    control={form.control}
                                    name="distilleryId"
                                    render={({ field }) => (
                                        <FormItem className="min-w-0 flex-1 space-y-1.5">
                                            <FormLabel required>
                                                Distillery
                                            </FormLabel>
                                            <FormControl>
                                                <VirtualizedCombobox
                                                    required
                                                    options={
                                                        distilleriesOptions
                                                    }
                                                    className="font-normal"
                                                    searchPlaceholder="Select a distillery"
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    disabled={
                                                        distilleriesQuery.isLoading
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="regionId"
                                    render={({ field }) => (
                                        <FormItem className="min-w-0 flex-1 space-y-1.5">
                                            <FormLabel required>
                                                Region
                                            </FormLabel>
                                            <FormControl>
                                                <VirtualizedCombobox
                                                    className="font-normal"
                                                    required
                                                    options={regionsOptions}
                                                    searchPlaceholder="Select a region"
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    disabled={
                                                        regionsQuery.isLoading
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex w-full gap-2 tb:flex-col tb:gap-4">
                                <FormField
                                    control={form.control}
                                    name="classification"
                                    render={({ field }) => (
                                        <FormItem className="min-w-0 flex-1 space-y-1.5">
                                            <FormLabel required>
                                                Category
                                            </FormLabel>
                                            <FormControl>
                                                <VirtualizedCombobox
                                                    className="font-normal"
                                                    required
                                                    options={
                                                        classificationsOptions
                                                    }
                                                    searchPlaceholder="Select a category"
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    disabled={
                                                        classificationsQuery.isLoading
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="peatLevels"
                                    render={({ field }) => (
                                        <FormItem className="min-w-0 flex-1 space-y-1.5">
                                            <FormLabel>Peat Level</FormLabel>
                                            <FormControl>
                                                <VirtualizedCombobox
                                                    className="font-normal"
                                                    options={PEAT_LEVEL_OPTIONS}
                                                    searchPlaceholder="Select peat level"
                                                    value={field.value ?? ""}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex w-full gap-[10px] tb:flex-col tb:gap-4">
                                <FormField
                                    control={form.control}
                                    name="caskTypeId"
                                    render={({ field }) => (
                                        <FormItem className="min-w-0 flex-1 space-y-1.5">
                                            <FormLabel required>
                                                Cask Type
                                            </FormLabel>
                                            <FormControl>
                                                <VirtualizedCombobox
                                                    required
                                                    className="font-normal"
                                                    options={caskTypesOptions}
                                                    searchPlaceholder="Select a cask type"
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    disabled={
                                                        caskTypesQuery.isLoading
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="min-w-0 flex-1 tb:hidden" />
                            </div>
                        </div>
                    </form>
                </Form>

                {/* 3. Vintage Management */}
                <VintagesSection
                    variantsMasterId={variantsMasterId ?? ""}
                    variantsForm={variantsForm}
                    onVariantFormStateChange={handleVariantFormStateChange}
                />
            </div>
            {DiscardChangesDialog}
        </div>
    );
}
