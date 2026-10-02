"use client";

import { FormImageUpload } from "@/components/shared/form-image-upload";
import { ListingCaskV2Header } from "@/components/shared/listing-cask-add-v2/ListingCaskV2Header";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VirtualizedCombobox } from "@/components/ui/virtualized-combobox";
import { setFormErrors } from "@/helpers";
import {
    DISTILLERY_KEYS,
    PATH_DISTILLERIES,
    PATH_REGIONS,
    ROUTE_DASHBOARD,
} from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import distilleriesServices from "@/services/distilleries";
import regionsServices from "@/services/region";
import { distillery } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { distilleryFormSchema } from "@/lib/validators";
import { z } from "zod";
import { useFormChangeDetector } from "@/hooks/useFormChangeDetector";

const RichTextEditor = dynamic(
    () =>
        import("@/components/ui/rich-text-editor").then(
            (module) => module.RichTextEditor
        ),
    { ssr: false, loading: () => <Skeleton className="h-48 w-full" /> }
);

type FormValues = z.infer<typeof distilleryFormSchema>;

const initialValues: FormValues = {
    name: "",
    country: "",
    region: "",
    company: "",
    establishedYear: "",
    website: "",
    description: "",
    status: "active",
    image: "",
    summary: "",
};

export default function DistilleryEditModule({ id }: { id: string }) {
    const router = useRouter();
    const imageFileRef = useRef<File | null>(null);
    const detailQuery = useQuery({
        queryKey: [PATH_DISTILLERIES, DISTILLERY_KEYS.LISTING, id],
        queryFn: () => distilleriesServices.getDetailDistillery(id),
    });

    const regionsQuery = useQuery({
        queryKey: [PATH_REGIONS, id],
        queryFn: () => regionsServices.getRegions(),
    });
    const updateMutation = useMutation({
        mutationFn: (values: Record<string, unknown>) =>
            distilleriesServices.updateDetailDistillery(id, values),
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(distilleryFormSchema),
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
            "country",
            "region",
            "company",
            "establishedYear",
            "website",
            "description",
            "status",
            "summary",
        ],
        fileFields: ["image"],
    });

    React.useEffect(() => {
        if (!detailQuery.data || !regionsQuery.data) return;
        const d = detailQuery.data as distillery.TDistillery;

        // Map region: API returns region as ID string, convert to string for form
        const region = d.region ? String(d.region) : "";

        const resetValues = {
            ...initialValues,
            name: d.name || "",
            country: d.country || "",
            region,
            company: d.company || "",
            establishedYear: d.establishedYear?.toString() || "",
            website: d.website || "",
            description: d.description || "",
            status: d.status || "inactive",
            image: d.imageUrl || "",
            summary: d.summary || "",
        };

        form.reset(resetValues);
        setInitialSnapshot(resetValues);
    }, [detailQuery.data, regionsQuery.data, form, setInitialSnapshot]);

    const queryClient = useQueryClient();

    const onSubmit = async (values: FormValues) => {
        try {
            if (!computeHasChanges(values)) {
                toast.info("No changes detected");
                return;
            }
            const dataToSubmit = getChangedValues(values) as Record<
                string,
                unknown
            >;

            // Handle image file: if there's a new file, use File object instead of blob URL
            if (imageFileRef.current) {
                // User uploaded a new file, use the File object
                dataToSubmit.image = imageFileRef.current;
            } else if (
                "image" in dataToSubmit &&
                typeof dataToSubmit.image === "string" &&
                dataToSubmit.image?.startsWith("blob:")
            ) {
                delete dataToSubmit.image;
            } else if ("image" in dataToSubmit && !dataToSubmit.image) {
                // If image was cleared, set to empty string
                dataToSubmit.image = "";
            }

            await updateMutation.mutateAsync(dataToSubmit);

            // Invalidate distillery detail and listing queries
            queryClient.invalidateQueries({
                queryKey: [PATH_DISTILLERIES, DISTILLERY_KEYS.LISTING, id],
            });
            queryClient.invalidateQueries({
                queryKey: [PATH_DISTILLERIES, DISTILLERY_KEYS.LISTING],
            });

            toast.success("Distillery updated successfully");

            // Clear the image file ref after successful update
            imageFileRef.current = null;
        } catch (error) {
            const { haveError } = setFormErrors(error, form, {
                capitalizeFirstLetter: true,
            });
            if (!haveError) {
                toast.error(
                    getErrorMessage(error, "Failed to update distillery")
                );
            }
        }
    };
    const detailImage = detailQuery.data?.imageUrl;
    const distilleryName = form.watch("name") || "Edit Distillery";

    return (
        <div className="relative w-full">
            <ListingCaskV2Header
                title={distilleryName}
                status={detailQuery.data?.status}
                updatedAt={detailQuery.data?.updatedAt}
                onBack={() => router.push(ROUTE_DASHBOARD.DISTILLERY)}
                right={
                    <Button
                        type="submit"
                        form="distillery-edit-form"
                        variant="secondary"
                        className="h-10 min-w-0 rounded-none !bg-bg-dark-main px-5 py-[0.8125rem] text-sm font-medium leading-none !text-typo-dark-primary hover:!bg-bg-dark-main focus-visible:!bg-bg-dark-main disabled:!bg-bg-sf2 disabled:!text-typo-soft mb:h-9 mb:px-3 mb:text-xs"
                        disabled={!hasFormChanged || updateMutation.isPending}
                    >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                }
            />

            {detailQuery.isLoading ? (
                <div className="w-full bg-bg-sf1 p-10 tb:p-6 mb:p-4">
                    <DistilleryEditSkeleton />
                </div>
            ) : detailQuery.isError ? (
                <div className="w-full bg-bg-sf1 p-10 tb:p-6 mb:p-4">
                    <div className="rounded border border-error bg-error/10 p-4 text-error">
                        Failed to load distillery
                    </div>
                </div>
            ) : (
                <div className="w-full bg-bg-sf1 p-10 tb:p-6 mb:p-4">
                    <Form {...form}>
                        <form
                            id="distillery-edit-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8 tb:space-y-6 mb:space-y-4"
                        >
                            <section className="flex flex-col gap-4 rounded-none border border-bd-main bg-bg-main p-8 tb:p-6 mb:p-4">
                                <h2 className="text-lg font-semibold text-typo-primary mb:text-base">
                                    General Information
                                </h2>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel required>
                                                    Distillery Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        required
                                                        className="text-sm"
                                                        placeholder="e.g., Cask Exchange Distillery"
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
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormImageUpload
                                                    label="Image"
                                                    classNameImageUpload="aspect-square size-[180px] max-w-full"
                                                    appearance="general-information"
                                                    required
                                                    form={form}
                                                    fieldName="image"
                                                    placeholder="Click to upload"
                                                    helperText=".png or .jpg only (max 5MB)"
                                                    accept={{
                                                        "image/*": [
                                                            ".png",
                                                            ".jpg",
                                                        ],
                                                    }}
                                                    defaultValue={
                                                        detailImage
                                                            ? [detailImage]
                                                            : undefined
                                                    }
                                                    onValueChange={(files) => {
                                                        if (files?.length) {
                                                            imageFileRef.current =
                                                                files[0];
                                                            field.onChange(
                                                                files[0]
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
                            </section>

                            <section className="flex flex-col gap-4 rounded-none border border-bd-main bg-bg-main p-8 tb:p-6 mb:p-4">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-typo-primary mb:text-base">
                                        Distillery Details
                                    </h2>
                                    <p className="text-sm font-normal leading-[1.5] text-typo-soft">
                                        Update the public information shown on
                                        the distillery page.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="summary"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel required>
                                                    Summary
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        className="min-h-32 text-sm"
                                                        required
                                                        placeholder="e.g., Known for their peppery, maritime character with moderate peat..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel>Website</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="text-sm"
                                                        placeholder="e.g., https://example.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel required>
                                                    Description
                                                </FormLabel>
                                                <FormControl>
                                                    <RichTextEditor
                                                        {...field}
                                                        placeholder="e.g., Known for their peppery, maritime character with moderate peat..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            <section className="flex flex-col gap-4 rounded-none border border-bd-main bg-bg-main p-8 tb:p-6 mb:p-4">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-typo-primary mb:text-base">
                                        Specifications
                                    </h2>
                                    <p className="text-sm font-normal leading-[1.5] text-typo-soft">
                                        Update the distillery location, company
                                        and founding year.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 tb:grid-cols-1">
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem className="min-w-0 space-y-1.5">
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="text-sm"
                                                        placeholder="e.g., Scotland"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="region"
                                        render={({ field }) => (
                                            <FormItem className="min-w-0 space-y-1.5">
                                                <FormLabel>Region</FormLabel>
                                                <FormControl>
                                                    <VirtualizedCombobox
                                                        options={
                                                            regionsQuery.data?.map(
                                                                (region) => ({
                                                                    value: String(
                                                                        region.name
                                                                    ),
                                                                    label: region.name,
                                                                })
                                                            ) || []
                                                        }
                                                        className="w-full font-normal"
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

                                    <FormField
                                        control={form.control}
                                        name="company"
                                        render={({ field }) => (
                                            <FormItem className="min-w-0 space-y-1.5">
                                                <FormLabel>Company</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className="text-sm"
                                                        placeholder="e.g., Cask Exchange"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="establishedYear"
                                        render={({ field }) => (
                                            <FormItem className="min-w-0 space-y-1.5">
                                                <FormLabel>
                                                    Founding Year
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="text-sm"
                                                        placeholder="e.g., 1990"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>
                        </form>
                    </Form>
                </div>
            )}
        </div>
    );
}

const DistilleryEditSkeleton = () => {
    return (
        <div className="space-y-8 tb:space-y-6 mb:space-y-4" aria-hidden="true">
            <div className="flex flex-col gap-4 border border-bd-main bg-bg-main p-8 tb:p-6 mb:p-4">
                <Skeleton className="h-5 w-44 rounded-none" />
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24 rounded-none" />
                        <Skeleton className="h-10 w-full rounded-none" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-16 rounded-none" />
                        <Skeleton className="h-6 w-24 rounded-none" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-14 rounded-none" />
                        <Skeleton className="size-[11.25rem] max-w-full rounded-none" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 border border-bd-main bg-bg-main p-8 tb:p-6 mb:p-4">
                <div className="space-y-1">
                    <Skeleton className="h-5 w-36 rounded-none" />
                    <Skeleton className="h-4 w-72 max-w-full rounded-none" />
                </div>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-20 rounded-none" />
                        <Skeleton className="h-32 w-full rounded-none" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-16 rounded-none" />
                        <Skeleton className="h-10 w-full rounded-none" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24 rounded-none" />
                        <Skeleton className="h-48 w-full rounded-none" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 border border-bd-main bg-bg-main p-8 tb:p-6 mb:p-4">
                <div className="space-y-1">
                    <Skeleton className="h-5 w-32 rounded-none" />
                    <Skeleton className="h-4 w-80 max-w-full rounded-none" />
                </div>
                <div className="grid grid-cols-2 gap-4 tb:grid-cols-1">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="space-y-1.5">
                            <Skeleton className="h-4 w-24 rounded-none" />
                            <Skeleton className="h-10 w-full rounded-none" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
