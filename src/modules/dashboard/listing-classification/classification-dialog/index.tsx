"use client";

import { FormImageUpload } from "@/components/shared/form-image-upload";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { classification } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const classificationSchema = z.object({
    label: z.string().min(1, "Classification name is required"),
    image: z.string().min(1, "Classification image is required"),
    description: z.string().optional(),
});

export type ClassificationFormValues = z.infer<typeof classificationSchema>;
export type ClassificationSubmitValues = Omit<
    ClassificationFormValues,
    "image"
> & {
    image?: File;
};

const EMPTY_FORM_VALUES: ClassificationFormValues = {
    label: "",
    image: "",
    description: "",
};

type TClassificationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classification?: classification.TClassification | null;
    onSave: (data: ClassificationSubmitValues) => Promise<void>;
    mode: "add" | "edit";
};

export default function ClassificationDialog({
    open,
    onOpenChange,
    classification: classificationData,
    onSave,
    mode,
}: TClassificationDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const imageFileRef = useRef<File | null>(null);

    const form = useForm<ClassificationFormValues>({
        resolver: zodResolver(classificationSchema),
        mode: "onChange",
        defaultValues: {
            ...EMPTY_FORM_VALUES,
            label: classificationData?.label || "",
            image: classificationData?.imageUrl || "",
            description: classificationData?.description || "",
        },
    });
    const nameValue = form.watch("label");
    const imageValue = form.watch("image");

    React.useEffect(() => {
        imageFileRef.current = null;

        if (open && classificationData && mode === "edit") {
            form.reset({
                label: classificationData.label || "",
                image: classificationData.imageUrl || "",
                description: classificationData.description || "",
            });
        } else if (open && mode === "add") {
            form.reset(EMPTY_FORM_VALUES);
        }
    }, [open, classificationData, mode, form]);

    const handleSubmit = async (data: ClassificationFormValues) => {
        setIsSubmitting(true);
        try {
            await onSave({
                label: data.label,
                description: data.description,
                ...(imageFileRef.current && { image: imageFileRef.current }),
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Error saving classification:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            direction="bottom"
            repositionInputs={false}
        >
            <DrawerContent className="mt-0 h-auto max-h-dvh overflow-hidden rounded-none border-x-0 border-b-0 border-t-bd-main bg-bg-main p-0">
                <div className="flex h-full flex-col bg-bg-main">
                    <div className="border-b border-bd-main">
                        <div className="container grid shrink-0 grid-cols-16 py-[1.375rem] tb:grid-cols-12 mb:grid-cols-4 mb:py-5">
                            <div className="col-start-4 -col-end-4 mx-auto w-full tb:col-start-1 tb:-col-end-1">
                                <DrawerTitle className="mb-0 font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                                    {mode === "add"
                                        ? "Create Classification"
                                        : "Update Classification"}
                                </DrawerTitle>
                            </div>
                            <DrawerDescription className="sr-only">
                                {mode === "add"
                                    ? "Create a new classification"
                                    : "Update classification details"}
                            </DrawerDescription>
                        </div>
                    </div>

                    <div className="container grid min-h-0 flex-1 grid-cols-16 overflow-y-auto tb:grid-cols-12 mb:grid-cols-4">
                        <Form {...form}>
                            <form
                                id="classification-form"
                                onSubmit={form.handleSubmit(handleSubmit)}
                                className="col-start-4 -col-end-4 mx-auto flex w-full flex-col gap-4 py-8 tb:col-start-1 tb:-col-end-1 mb:px-4 mb:py-5"
                            >
                                <FormField
                                    control={form.control}
                                    name="label"
                                    render={({ field }) => (
                                        <FormItem className="space-y-[0.375rem]">
                                            <FormLabel required>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    inputSize="lg"
                                                    className="text-sm"
                                                    placeholder="e.g. Scotch Whisky"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={() => (
                                        <FormItem className="space-y-[0.375rem]">
                                            <FormImageUpload
                                                label="Image"
                                                required
                                                form={form}
                                                fieldName="image"
                                                defaultValue={
                                                    classificationData?.imageUrl
                                                        ? [
                                                              classificationData.imageUrl,
                                                          ]
                                                        : undefined
                                                }
                                                accept={{
                                                    "image/*": [".png", ".jpg"],
                                                }}
                                                appearance="general-information"
                                                onValueChange={(files) => {
                                                    imageFileRef.current =
                                                        files?.[0] || null;
                                                }}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="space-y-[0.375rem]">
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <textarea
                                                    className="flex h-20 min-h-20 w-full resize-none border border-transparent bg-bg-sf4 px-4 py-3 text-sm outline-none transition-colors placeholder:text-typo-soft hover:border-bd-main focus-visible:border-bd-brown-lighter disabled:cursor-not-allowed disabled:bg-bg-disable"
                                                    placeholder="Describe this cask type — its size, wood origin, and typical flavour contribution…"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>

                    <div className="shrink-0 border-t border-bd-main py-6 tb:py-5 mb:py-5">
                        <div className="container grid grid-cols-16 tb:grid-cols-12 mb:grid-cols-4">
                            <div className="col-start-4 -col-end-4 flex w-full justify-end gap-1 tb:col-start-1 tb:-col-end-1 mb:flex-col-reverse mb:items-stretch">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                    className="min-w-0 px-5 py-[0.8125rem] text-sm mb:w-full"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="action"
                                    form="classification-form"
                                    disabled={
                                        isSubmitting ||
                                        !nameValue.trim() ||
                                        !imageValue
                                    }
                                    className="min-w-0 px-5 py-[0.8125rem] text-sm disabled:!bg-bg-sf3 disabled:!text-typo-primary/[0.15] mb:w-full"
                                >
                                    {isSubmitting
                                        ? "Saving..."
                                        : mode === "add"
                                          ? "Create"
                                          : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
