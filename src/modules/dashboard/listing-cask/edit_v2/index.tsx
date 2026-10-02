"use client";

import { FormImageUpload } from "@/components/shared/form-image-upload";
import { CaskFormSkeleton } from "@/components/shared/listing-cask-add-v2/CaskFormSkeleton";
import {
    DUPLICATE_VARIANT_ID,
    NEW_VARIANT_ID,
    type VariantFormState,
    type VariantsFormHandle,
} from "@/components/shared/listing-cask-add-v2/FormVariantsGroup";
import { ListingCaskV2Header } from "@/components/shared/listing-cask-add-v2/ListingCaskV2Header";
import { VintagesSection } from "@/components/shared/listing-cask-add-v2/VintagesSection";
import { CaskEditMoreActions } from "./CaskEditMoreActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    CASK_MASTER_KEYS,
    DISTILLERY_KEYS,
    FILTER_KEYS,
    PATH_CLASSIFICATION,
    PATH_DISTILLERIES,
    PATH_META_DATA_CASK,
    PATH_REGIONS,
    ROUTE_DASHBOARD,
    ROUTE_PUBLIC,
} from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { caskFormSchema, caskMasterFormSchema } from "@/lib/validators";
import caskServices from "@/services/cask";
import caskMasterServices from "@/services/cask-master";
import classificationsServices from "@/services/classifications";
import distilleriesServices from "@/services/distilleries";
import regionsServices from "@/services/region";
import { useCaskVariants } from "@/store/dashboard/CaskProvider";
import { cask, caskMaster } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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

const getMasterFormValues = (
    data: caskMaster.TCaskMasterWithChildren | undefined
): FormValues | null => {
    if (!data) return null;

    return {
        name: data.name || "",
        status: (data.status as "active" | "inactive") || "active",
        distilleryId: data.distilleryId || data.distillery?.id || "",
        caskTypeId: String(data.caskTypeId || data.caskType?.id || ""),
        regionId: String(data.regionId || data.region?.id || ""),
        classification: data.classification || "",
        peatLevels: data.peatLevels || "",
        imageUrl: data.imageUrl || "",
    };
};

export default function CaskEditModuleV2({ id }: { id: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const imageFileRef = useRef<File | string | null>(null);
    const {
        setListVariants,
        setActiveVariantId,
        setIsCreating,
        activeVariantId,
        variants,
    } = useCaskVariants();
    const activeVariantIdRef = useRef<string | null>(activeVariantId);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [activeMoreAction, setActiveMoreAction] = useState(0);
    const [discardVersion, setDiscardVersion] = useState(0);
    const isEmpty = variants.length === 0;
    const detailQuery = useQuery({
        queryKey: [CASK_KEYS.CASK_ADMIN_DETAIL, id],
        queryFn: () => caskMasterServices.getDetailCaskMaster(id),
    });
    const variantsForm = useRef<VariantsFormHandle | null>(null);
    const [variantFormState, setVariantFormState] = useState<VariantFormState>({
        isDirty: false,
        isValid: true,
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

    const distilleriesQuery = useQuery({
        queryKey: [PATH_DISTILLERIES, DISTILLERY_KEYS.LISTING, id],
        queryFn: () => distilleriesServices.getDistillery("page=1&limit=1000"),
    });
    const caskTypesQuery = useQuery({
        queryKey: [FILTER_KEYS.CASK_TYPE, id],
        queryFn: () => caskServices.getCaskTypes("page=1&size=1000"),
    });
    const classificationsQuery = useQuery({
        queryKey: [PATH_META_DATA_CASK, PATH_CLASSIFICATION, id],
        queryFn: () => classificationsServices.getClassification(),
    });
    const regionsQuery = useQuery({
        queryKey: [PATH_REGIONS, id],
        queryFn: () => regionsServices.getRegions(),
    });
    const updateMutation = useMutation({
        mutationFn: (
            values: Partial<caskMaster.TCaskMasterUpdateInput> & {
                image?: File;
            }
        ) => caskMasterServices.updateCaskMaster(id, values),
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to update cask"));
        },
    });
    const deleteMutation = useMutation({
        mutationFn: () => caskMasterServices.deleteCaskMaster(id),
        onSuccess: () => {
            toast.success("Cask deleted successfully");
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.LISTING_PAGE],
            });
            router.push(ROUTE_DASHBOARD.CASK);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to delete cask"));
        },
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(caskFormSchema),
        defaultValues: initialValues,
    });

    const {
        hasFormChanged,
        setInitialSnapshot,
        computeHasChanges,
        getChangedValues,
    } = useFormChangeDetector<FormValues>({
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

    const hasPendingVariant = variants.some((variant) => {
        const variantId = String(variant.id);
        return (
            variantId.includes(NEW_VARIANT_ID) ||
            variantId.includes(DUPLICATE_VARIANT_ID)
        );
    });
    const shouldBlockLeavePage =
        !isSavingAll &&
        (hasFormChanged ||
            form.formState.isDirty ||
            variantFormState.isDirty ||
            hasPendingVariant);
    const { confirmAndRun, DiscardChangesDialog } =
        useLeavePageActionWithDiscardDialog({
            shouldBlock: shouldBlockLeavePage,
        });

    const onSubmit = async (values: FormValues) => {
        try {
            if (!hasFormChanged) {
                // Return no change in Master form
                return;
            }
            const dataToSubmit = getChangedValues(values) as FormValues & {
                referencePriceMin?: number;
                referencePriceMax?: number;
                image?: File;
            };
            if (imageFileRef.current) {
                if (imageFileRef.current instanceof File) {
                    dataToSubmit.image = imageFileRef.current;
                }
            }

            await updateMutation.mutateAsync(dataToSubmit);
            // Clear image file ref after successful update
            imageFileRef.current = null;

            // Mark form as "clean" so leaving page won't prompt
            form.reset(values);
            setInitialSnapshot(values);

            queryClient.invalidateQueries({
                queryKey: [CASK_MASTER_KEYS.CASK_MASTER_DETAIL, id],
            });
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.CASK_ADMIN_DETAIL, id],
            });
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.LISTING_PAGE],
            });
        } catch (error) {
            setFormErrors(error, form, { capitalizeFirstLetter: true });
        }
    };

    const handleSaveAll = async () => {
        if (isSavingAll) return;
        setIsSavingAll(true);
        try {
            const submitMain = form.handleSubmit(onSubmit);

            if (activeVariantId) {
                const activeVariantKey = String(activeVariantId);
                const isCreatingVariant =
                    activeVariantKey.includes(NEW_VARIANT_ID) ||
                    activeVariantKey.includes(DUPLICATE_VARIANT_ID);
                try {
                    await variantsForm.current?.onSubmit?.(isCreatingVariant);
                } catch {
                    return;
                }
            }
            await submitMain();
            toast.success("Cask updated successfully");
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.CASK_DETAIL, id],
            });
            queryClient.invalidateQueries({
                queryKey: [CASK_KEYS.LISTING_PAGE],
            });
        } finally {
            setIsSavingAll(false);
        }
    };

    const handleBack = () => {
        void confirmAndRun(() => router.push(ROUTE_DASHBOARD.CASK));
    };

    const handleDiscardChanges = () => {
        void confirmAndRun(() => {
            const resetValues = getMasterFormValues(detailQuery.data);
            if (resetValues) {
                form.reset(resetValues);
                setInitialSnapshot(resetValues);
            }

            imageFileRef.current = null;

            const originalVariants = detailQuery.data?.children ?? [];
            const currentActiveVariantId = String(activeVariantId ?? "");
            const nextActiveVariantId = originalVariants.some(
                (variant) => String(variant.id) === currentActiveVariantId
            )
                ? currentActiveVariantId
                : String(originalVariants[0]?.id ?? "");

            setListVariants(originalVariants);
            setIsCreating(false);
            setActiveVariantId(nextActiveVariantId);
            setVariantFormState({ isDirty: false, isValid: true });
            setDiscardVersion((version) => version + 1);
        });
    };

    useEffect(() => {
        if (detailQuery.data?.children) {
            setListVariants(detailQuery.data.children);
        }
    }, [detailQuery.data?.children, setListVariants]);

    useEffect(() => {
        activeVariantIdRef.current = activeVariantId;
    }, [activeVariantId]);

    useEffect(() => {
        const children = detailQuery.data?.children;
        if (!children) return;

        const currentActiveVariantId = activeVariantIdRef.current;
        const activeVariantKey = String(currentActiveVariantId);
        const isPendingVariant =
            activeVariantKey.includes(NEW_VARIANT_ID) ||
            activeVariantKey.includes(DUPLICATE_VARIANT_ID);
        if (isPendingVariant) return;

        const stillExists = currentActiveVariantId
            ? children.some(
                  (variant) =>
                      String(variant.id) === String(currentActiveVariantId)
              )
            : false;

        if (!currentActiveVariantId || !stillExists) {
            setActiveVariantId(children[0]?.id ?? "");
        }
    }, [detailQuery.data?.children, setActiveVariantId]);

    useEffect(() => {
        const d = detailQuery.data as
            | (cask.TCask & { peatLevels?: string })
            | undefined;
        // Wait for both detail data and options to be loaded
        if (
            !d ||
            !distilleriesQuery.data ||
            !caskTypesQuery.data ||
            !classificationsQuery.data ||
            !regionsQuery.data
        )
            return;

        const initialValues: FormValues = {
            name: d.name || "",
            status: (d.status as "active" | "inactive") || "active",
            distilleryId: d.distilleryId || d.distillery?.id || "",
            caskTypeId: String(d.caskTypeId || d.caskType?.id || ""),
            regionId: String(d.regionId || d.region?.id || ""),
            classification: d.classification || "",
            peatLevels: d.peatLevels || "",
            imageUrl: d.imageUrl || "",
        };
        form.reset(initialValues);
        setInitialSnapshot(initialValues);
    }, [
        detailQuery.data,
        distilleriesQuery?.data,
        caskTypesQuery?.data,
        classificationsQuery?.data,
        regionsQuery?.data,
        form,
        setInitialSnapshot,
    ]);

    useEffect(() => {
        if (!activeVariantId || isEmpty) {
            setVariantFormState({ isDirty: false, isValid: true });
        }
    }, [activeVariantId, isEmpty]);

    const distilleriesOptions = useMemo(() => {
        return (
            distilleriesQuery?.data?.map((distillery) => ({
                value: distillery.id,
                label: distillery.name,
            })) || []
        );
    }, [distilleriesQuery.data]);

    const caskTypesOptions = useMemo(() => {
        return (
            caskTypesQuery.data?.caskTypes?.map((ct) => ({
                value: ct.id,
                label: ct.name,
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

    return (
        <div className="relative w-full">
            <ListingCaskV2Header
                title={detailQuery.data?.name || "Cask Detail"}
                status={detailQuery.data?.status}
                onBack={handleBack}
                right={
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            onClick={handleDiscardChanges}
                            variant="outline"
                            className="h-10 min-w-0 rounded-none px-5 py-[0.8125rem] text-sm font-medium leading-none text-typo-primary mb:h-9 mb:px-3 mb:text-xs"
                            disabled={!shouldBlockLeavePage}
                        >
                            Discard
                        </Button>
                        <Button
                            type="button"
                            onClick={() => void handleSaveAll()}
                            variant="secondary"
                            className="h-10 min-w-0 rounded-none !bg-bg-dark-main px-5 py-[0.8125rem] text-sm font-medium leading-none !text-typo-dark-primary hover:!bg-bg-dark-main focus-visible:!bg-bg-dark-main disabled:!bg-bg-sf2 disabled:!text-typo-soft mb:h-9 mb:px-3 mb:text-xs"
                            disabled={
                                isSavingAll ||
                                updateMutation.isPending ||
                                variantsForm.current?.isSubmitting ||
                                form.formState.isSubmitting
                            }
                            title={
                                activeVariantId && variantFormState.isDirty
                                    ? "Vintage form has unsaved changes"
                                    : undefined
                            }
                        >
                            {isSavingAll || updateMutation.isPending
                                ? "Saving..."
                                : "Save"}
                        </Button>
                    </div>
                }
                moreActions={
                    <CaskEditMoreActions
                        activeAction={activeMoreAction}
                        onActiveActionChange={setActiveMoreAction}
                        onView={() => {
                            const isPendingVariant =
                                !activeVariantId ||
                                String(activeVariantId).includes(
                                    NEW_VARIANT_ID
                                ) ||
                                String(activeVariantId).includes(
                                    DUPLICATE_VARIANT_ID
                                );
                            const activeIdParam = !isPendingVariant
                                ? `?active=${activeVariantId}`
                                : "";
                            window.open(
                                `${ROUTE_PUBLIC.CASK_DETAILS}/${id}${activeIdParam}`,
                                "_blank",
                                "noopener,noreferrer"
                            );
                        }}
                        onDelete={() => setIsDeleteDialogOpen(true)}
                    />
                }
            />

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent
                    isShowClose
                    className="w-full max-w-[31.25rem] gap-0 border-0 bg-bg-main p-0 shadow-none mb:max-w-[calc(100vw-2rem)]"
                    classClose="rounded-lg p-2 text-icon-main hover:text-icon-highlight"
                >
                    <AlertDialogHeader className="space-y-0 text-center sm:text-center">
                        <AlertDialogTitle className="mb-2 w-full font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                            Delete Cask?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="w-full text-center text-sm font-normal leading-[1.5] text-typo-soft">
                            Are you sure you want to delete this cask and all
                            its associated vintages. This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 w-full items-start gap-1 mb:mt-6 mb:flex-col-reverse mb:gap-2">
                        <AlertDialogCancel
                            className="h-12 min-w-[9.375rem] flex-1 rounded-none border border-bd-main bg-transparent px-8 py-4 text-sm font-medium leading-none text-typo-primary outline-none hover:bg-transparent hover:text-typo-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary mb:h-10 mb:w-full mb:min-w-0 mb:px-4 mb:py-2"
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 min-w-[9.375rem] flex-1 rounded-none border-0 !bg-bg-dark-main px-8 py-4 text-sm font-medium leading-none !text-typo-dark-primary outline-none hover:!bg-bg-dark-main focus-visible:!bg-bg-dark-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary mb:h-10 mb:w-full mb:min-w-0 mb:px-4 mb:py-2"
                            disabled={deleteMutation.isPending}
                            onClick={async () => {
                                await deleteMutation.mutateAsync();
                                setIsDeleteDialogOpen(false);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {detailQuery.isLoading ? (
                <div className="w-full bg-bg-sf1 p-10 tb:p-6 mb:p-4">
                    <CaskFormSkeleton />
                </div>
            ) : detailQuery.isError ? (
                <div className="w-full bg-bg-sf1 p-10 tb:p-6 mb:p-4">
                    <div className="rounded border border-error bg-error/10 p-4 text-error">
                        Failed to load cask
                    </div>
                </div>
            ) : (
                <div className="w-full space-y-8 bg-bg-sf1 p-10 tb:space-y-6 tb:p-6 mb:space-y-4 mb:p-4">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
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
                                                    helperText=".png or .jpg only (max 5MB)"
                                                    placeholder="Click to upload"
                                                    accept={{
                                                        "image/*": [
                                                            ".png",
                                                            ".jpg",
                                                        ],
                                                    }}
                                                    defaultValue={
                                                        field.value
                                                            ? [field.value]
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
                                        Categorise this cask to help buyers
                                        discover it on the marketplace.
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
                                                        className="font-normal"
                                                        required
                                                        options={
                                                            distilleriesOptions
                                                        }
                                                        searchPlaceholder="Select a distillery"
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        disabled={
                                                            distilleriesQuery?.isLoading
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
                                                        required
                                                        className="font-normal"
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
                                                <FormLabel>
                                                    Peat Level
                                                </FormLabel>
                                                <FormControl>
                                                    <VirtualizedCombobox
                                                        className="font-normal"
                                                        options={
                                                            PEAT_LEVEL_OPTIONS
                                                        }
                                                        searchPlaceholder="Select peat level"
                                                        value={
                                                            field.value ?? ""
                                                        }
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
                                                        options={
                                                            caskTypesOptions
                                                        }
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
                        key={discardVersion}
                        variantsMasterId={id}
                        variantsForm={variantsForm}
                        onVariantFormStateChange={handleVariantFormStateChange}
                    />
                </div>
            )}
            {DiscardChangesDialog}
        </div>
    );
}
