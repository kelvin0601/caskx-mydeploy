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
import distilleriesServices from "@/services/distilleries";
import regionsServices from "@/services/region";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { distilleryFormSchema } from "@/lib/validators";
import { z } from "zod";

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
    website: "",
    description: "",
    country: "",
    region: "",
    company: "",
    establishedYear: "",
    image: "",
    summary: "",
    status: "active",
};
export default function DistilleryAddModule() {
    const form = useForm<FormValues>({
        resolver: zodResolver(distilleryFormSchema),
        defaultValues: initialValues,
    });
    const router = useRouter();
    const imageFileRef = useRef<File | null>(null);
    const queryClient = useQueryClient();
    const regionsQuery = useQuery({
        queryKey: [PATH_REGIONS, "add"],
        queryFn: () => regionsServices.getRegions(),
    });

    const createMutation = useMutation({
        mutationFn: (values: FormValues) =>
            distilleriesServices.createDistillery(values),
    });

    const onSubmit = async (values: FormValues) => {
        try {
            const dataToSubmit = { ...values };

            // If there's a new image file, set it as File object for service to handle
            if (imageFileRef.current) {
                (dataToSubmit as Record<string, unknown>).image =
                    imageFileRef.current;
            } else if (
                typeof values.image === "string" &&
                values.image?.startsWith("blob:")
            ) {
                // If it's a blob URL but no file ref, reset it (shouldn't happen, but handle gracefully)
                delete (dataToSubmit as Record<string, unknown>).image;
            }

            await createMutation.mutateAsync(dataToSubmit);

            // Invalidate distillery listing queries to refresh the list
            queryClient.invalidateQueries({
                queryKey: [PATH_DISTILLERIES, DISTILLERY_KEYS.LISTING],
            });

            form.reset(initialValues);
            // Clear the image file ref after successful creation
            imageFileRef.current = null;
            toast.success("Distillery created successfully");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            setFormErrors(error, form, { capitalizeFirstLetter: true });
        }
    };
    const distilleryName = form.watch("name") || "New Distillery";

    return (
        <div className="relative w-full">
            <ListingCaskV2Header
                title={distilleryName}
                onBack={() => router.push(ROUTE_DASHBOARD.DISTILLERY)}
                right={
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            void form.handleSubmit(onSubmit)();
                        }}
                        className="h-10 min-w-0 rounded-none !bg-bg-dark-main px-5 py-[0.8125rem] text-sm font-medium leading-none !text-typo-dark-primary hover:!bg-bg-dark-main focus-visible:!bg-bg-dark-main disabled:!bg-bg-sf2 disabled:!text-typo-soft mb:h-9 mb:px-3 mb:text-xs"
                        disabled={
                            createMutation.isPending || !form.formState.isDirty
                        }
                    >
                        {createMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                }
            />

            <div className="w-full bg-bg-sf1 p-10 tb:p-6 mb:p-4">
                <Form {...form}>
                    <form
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
                                                    "image/*": [".png", ".jpg"],
                                                }}
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
                        </section>

                        <section className="flex flex-col gap-4 rounded-none border border-bd-main bg-bg-main p-8 tb:p-6 mb:p-4">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-lg font-semibold text-typo-primary mb:text-base">
                                    Distillery Details
                                </h2>
                                <p className="text-sm font-normal leading-[1.5] text-typo-soft">
                                    Add the public information shown on the
                                    distillery page.
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
                                                <RichTextEditor {...field} />
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
                                    Add the distillery location, company and
                                    founding year.
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
                                                    className="w-full font-normal"
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
                                            <FormLabel>Founding Year</FormLabel>
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
        </div>
    );
}
