"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { LabelWithOutForm } from "@/components/ui/label";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { formatDateTime } from "@/lib/utils";
import { checkoutServices } from "@/services/checkout";
import { useCheckout } from "@/store/checkout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function SignAgreementForm({
    onSuccess,
}: {
    onSuccess: () => void;
}) {
    const { sessionId, setPopupCurrent, setIsOpenPopup, statusTransaction } =
        useCheckout();

    const schemaSignAgreement = z.object({
        consent: z.boolean().refine((val) => val === true, {
            message: "Please confirm the agreement",
        }),
    });
    const signAgreementMutation = useMutation({
        mutationFn: checkoutServices.regenerateAgreement,
        mutationKey: [CHECKOUT_KEYS.REGENERATE_AGREEMENT, sessionId],
    });

    const form = useForm({
        resolver: zodResolver(schemaSignAgreement),
        defaultValues: {
            consent: false,
        },
    });

    const handleSubmit = async (data: z.infer<typeof schemaSignAgreement>) => {
        const result = await signAgreementMutation.mutateAsync(sessionId!);
        if (result.status === "sent") {
            toast.success("Agreement signed successfully");
            onSuccess?.();
        }
    };

    const handleOpenPopup = () => {
        if (!statusTransaction?.expiryDate) return;
        setPopupCurrent({
            title: `Sign Agreement: ${
                formatDateTime(statusTransaction.expiryDate).dateOnly
            }`,
            description:
                "Please sign your agreement by this date to secure your cask.",
            buttonText: "Sign now",
        });
        setIsOpenPopup(true);
    };
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex w-full flex-col gap-5"
            >
                <FormField
                    name="consent"
                    control={form.control}
                    render={({ field }) => (
                        <div className="flex flex-col">
                            <div className="flex cursor-pointer flex-row items-center gap-2">
                                <Checkbox
                                    id="consent"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <LabelWithOutForm htmlFor="consent">
                                    I have read and agree to the Purchase
                                    Agreement, including terms on payment,
                                    ownership transfer, and refunds.
                                </LabelWithOutForm>
                            </div>
                            <FormMessage />
                        </div>
                    )}
                />
                <div className="flex flex-row gap-3 self-end">
                    <Button variant="outline" onClick={handleOpenPopup}>
                        Sign later
                    </Button>
                    <Button
                        type="submit"
                        variant={"secondary"}
                        disabled={
                            !form.formState.isValid ||
                            form.formState.isSubmitting
                        }
                    >
                        {form.formState.isSubmitting
                            ? "Confirming..."
                            : "Confirm"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
