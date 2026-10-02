"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { distillery } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const distillerySchema = z.object({
    name: z.string().min(1, "Distillery name is required"),
    country: z.string().min(1, "Country is required"),
    region: z.string().min(1, "Region is required"),
    company: z.string().optional(),
    establishedYear: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val) return true;
                const year = parseInt(val);
                return year >= 1000 && year <= new Date().getFullYear();
            },
            {
                message: "Please enter a valid year",
            }
        ),
    website: z.string().url().optional().or(z.literal("")),
    description: z.string().optional(),
    isVerified: z.boolean().default(true),
});

export type DistilleryFormValues = z.infer<typeof distillerySchema>;

type TDistilleryDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    distillery?: distillery.TDistillery | null;
    onSave: (data: DistilleryFormValues) => Promise<void>;
    mode: "add" | "edit";
};

export default function DistilleryDialog({
    open,
    onOpenChange,
    distillery,
    onSave,
    mode,
}: TDistilleryDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<DistilleryFormValues>({
        resolver: zodResolver(distillerySchema),
        defaultValues: {
            name: distillery?.name || "",
            country: distillery?.country || "",
            region: distillery?.region || "",
            company: distillery?.company || "",
            establishedYear: distillery?.establishedYear?.toString() || "",
            website: distillery?.website || "",
            description: distillery?.description || "",
            isVerified: distillery?.isVerified ?? true,
        },
    });

    React.useEffect(() => {
        if (open && distillery && mode === "edit") {
            form.reset({
                name: distillery.name || "",
                country: distillery.country || "",
                region: distillery.region || "",
                company: distillery.company || "",
                establishedYear: distillery.establishedYear?.toString() || "",
                website: distillery.website || "",
                description: distillery.description || "",
                isVerified: distillery.isVerified ?? true,
            });
        } else if (open && mode === "add") {
            form.reset({
                name: "",
                country: "",
                region: "",
                company: "",
                establishedYear: "",
                website: "",
                description: "",
                isVerified: true,
            });
        }
    }, [open, distillery, mode, form]);

    const handleSubmit = async (data: DistilleryFormValues) => {
        setIsSubmitting(true);
        try {
            await onSave(data);
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Error saving distillery:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "add"
                            ? "Add New Distillery"
                            : "Edit Distillery"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            {/* Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Distillery Name{" "}
                                            <span className="text-error">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter distillery name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Country */}
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Country{" "}
                                            <span className="text-error">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter country"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Region */}
                            <FormField
                                control={form.control}
                                name="region"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Region{" "}
                                            <span className="text-error">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter region"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Company */}
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter company name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Established Year */}
                            <FormField
                                control={form.control}
                                name="establishedYear"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Founding Year</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter year"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Status */}
                            <FormField
                                control={form.control}
                                name="isVerified"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={(value) =>
                                                field.onChange(value === "true")
                                            }
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">
                                                    Active
                                                </SelectItem>
                                                <SelectItem value="false">
                                                    Inactive
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Website */}
                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://example.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <textarea
                                            className="flex min-h-[100px] w-full border border-transparent bg-bg-sf4 px-3 py-2 text-base outline-none transition-all placeholder:text-typo-soft hover:border-bd-main focus-visible:border-bd-brown-lighter disabled:cursor-not-allowed disabled:bg-bg-disable"
                                            placeholder="Enter distillery description"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Saving..."
                                    : mode === "add"
                                      ? "Add Distillery"
                                      : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
