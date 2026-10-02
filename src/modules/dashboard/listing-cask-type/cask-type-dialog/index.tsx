"use client";

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
import { caskType } from "@/types/cask-type";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const caskTypeSchema = z.object({
    name: z.string().min(1, "Cask type name is required"),
    typicalCapacityLiters: z.string().optional(),
    description: z.string().optional(),
});

export type CaskTypeFormValues = z.infer<typeof caskTypeSchema>;

const EMPTY_FORM_VALUES: CaskTypeFormValues = {
    name: "",
    typicalCapacityLiters: "",
    description: "",
};

type TCaskTypeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    caskType?: caskType.TCaskType | null;
    onSave: (data: CaskTypeFormValues) => Promise<void>;
    mode: "add" | "edit";
};

export default function CaskTypeDialog({
    open,
    onOpenChange,
    caskType: caskTypeData,
    onSave,
    mode,
}: TCaskTypeDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<CaskTypeFormValues>({
        resolver: zodResolver(caskTypeSchema),
        mode: "onChange",
        defaultValues: {
            name: caskTypeData?.name || "",
            typicalCapacityLiters: caskTypeData?.typicalCapacityLiters || "",
            description: caskTypeData?.description || "",
        },
    });
    const nameValue = form.watch("name");

    React.useEffect(() => {
        if (open && caskTypeData && mode === "edit") {
            form.reset({
                name: caskTypeData.name || "",
                typicalCapacityLiters: caskTypeData.typicalCapacityLiters || "",
                description: caskTypeData.description || "",
            });
        } else if (open && mode === "add") {
            form.reset(EMPTY_FORM_VALUES);
        }
    }, [open, caskTypeData, mode, form]);

    const handleSubmit = async (data: CaskTypeFormValues) => {
        setIsSubmitting(true);
        try {
            await onSave(data);
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Error saving cask type:", error);
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
            <DrawerContent className="mt-0 h-auto max-h-dvh overflow-hidden rounded-none border-x-0 border-b-0 border-t-bd-main bg-bg-main p-0 [&_[data-drawer-close]>div]:!size-4">
                <div className="flex h-full flex-col bg-bg-main">
                    <div className="border-b border-bd-main">
                        <div className="container grid shrink-0 grid-cols-16 py-[1.375rem] tb:grid-cols-12 mb:grid-cols-4 mb:py-5">
                            <div className="col-start-4 -col-end-4 mx-auto w-full tb:col-start-1 tb:-col-end-1">
                                <DrawerTitle className="mb-0 font-reckless text-xl font-medium leading-none text-typo-primary">
                                    {mode === "add"
                                        ? "Create Cask Type"
                                        : "Update Cask Type"}
                                </DrawerTitle>
                            </div>
                            <DrawerDescription className="sr-only">
                                {mode === "add"
                                    ? "Create a new cask type"
                                    : "Update cask type details"}
                            </DrawerDescription>
                        </div>
                    </div>
                    <div className="container grid min-h-0 flex-1 grid-cols-16 overflow-y-auto tb:grid-cols-12 mb:grid-cols-4">
                        <Form {...form}>
                            <form
                                id="cask-type-form"
                                onSubmit={form.handleSubmit(handleSubmit)}
                                className="col-start-4 -col-end-4 mx-auto flex w-full flex-col gap-4 py-8 tb:col-start-1 tb:-col-end-1 mb:px-4 mb:py-5"
                            >
                                <div className="flex w-full gap-2 tb:flex-col">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="min-w-0 flex-1 space-y-[0.375rem]">
                                                <FormLabel required>
                                                    Cask Type Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        inputSize="lg"
                                                        className="text-sm"
                                                        placeholder="e.g. Ex-Bourbon Hogshead"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="typicalCapacityLiters"
                                        render={({ field }) => (
                                            <FormItem className="min-w-0 flex-1 space-y-[0.375rem]">
                                                <FormLabel>
                                                    Typical Capacity Liters
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        inputSize="lg"
                                                        className="text-sm"
                                                        inputMode="decimal"
                                                        placeholder="e.g. 100"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

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

                    <div className="shrink-0 border-t border-bd-main px-4 py-6 tb:px-5 mb:py-5">
                        <div className="mx-auto flex w-full max-w-[47.25rem] justify-end gap-1 mb:flex-col-reverse mb:items-stretch">
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
                                form="cask-type-form"
                                disabled={isSubmitting || !nameValue.trim()}
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
            </DrawerContent>
        </Drawer>
    );
}
