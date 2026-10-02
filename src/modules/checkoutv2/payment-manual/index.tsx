"use client";

import { FormImageUpload } from "@/components/shared/form-image-upload";
import IconBanking from "@/components/shared/icons/icon-banking";
import IconCoppy from "@/components/shared/icons/icon-coppy";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { CHECKOUT_PAYMENT_METHOD, CHECKOUT_STATUS } from "@/enum/checkout";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { getErrorMessage } from "@/lib/utils";
import { checkoutServices } from "@/services/checkout";
import { useCheckout } from "@/store/checkout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Check } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type TBankDetailItem = {
    id: string;
    label: string;
    value: string;
};

const BANK_DETAILS: TBankDetailItem[] = [
    { id: "bank-name", label: "Bank Name:", value: "JPMorgan Chase" },
    { id: "routing", label: "Routing Number (U.S. Only):", value: "021000021" },
    { id: "account-num", label: "Account Number:", value: "660853279" },
    { id: "account-name", label: "Account Name:", value: "CASKX LLC" },
    {
        id: "swift",
        label: "SWIFT Code (International Only):",
        value: "CHASUS33",
    },
    {
        id: "reference",
        label: "Payment Reference Example:",
        value: "Invoice 1003",
    },
];

export const PaymentManual: React.FC = () => {
    return (
        <div className="w-full overflow-hidden rounded-lg bg-bg-main">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="bank-transfer" className="border-none">
                    <AccordionTrigger
                        className="[&>svg]:text-slate-500 mb-4 border-b px-6 pb-4 pt-4 text-left text-base font-medium text-typo-primary data-[state=closed]:mb-0 data-[state=closed]:border-none data-[state=closed]:pb-6 tb:px-4"
                        classNameChevron="h-5 w-5 text-slate-500"
                    >
                        <div className="flex flex-row items-center gap-2">
                            <div className="size-5">
                                <IconBanking />
                            </div>
                            Bank transfer
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-6 px-6 pt-0 tb:px-4 mb:gap-4">
                        <div className="flex flex-col">
                            <div className="mb-2 text-base font-semibold">
                                1. Complete Your Payment
                            </div>
                            <p className="mb-6 text-sm tb:mb-2">
                                Please use the following banking details to
                                complete your wire transfer. To ensure accurate
                                processing, include your invoice number in the
                                wire transfer reference field.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {BANK_DETAILS.map((detail, index) => (
                                            <DetailRow
                                                key={detail.id}
                                                label={detail.label}
                                                value={detail.value}
                                                isLast={
                                                    index ===
                                                    BANK_DETAILS.length - 1
                                                }
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="mb-2 text-base font-semibold">
                                2. Upload Payment Proof{" "}
                                <span className="text-brand">*</span>
                            </div>
                            <p className="text-slate-500 mb-4 text-sm leading-relaxed">
                                Upload a screenshot or photo of your transfer
                                confirmation. Only .png or .jpg files up to 5 MB
                                are accepted.
                            </p>
                            <ManualPaymentProofForm />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

type TDetailRowProps = {
    label: string;
    value: string;
    isLast?: boolean;
};

const DetailRow: React.FC<TDetailRowProps> = ({ label, value, isLast }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <tr className={`border-slate-100 ${!isLast ? "border-b" : ""}`}>
            <td className="w-[calc(248/841*100%)] py-4 pr-4 align-middle text-sm font-normal">
                {label}
            </td>
            <td className="py-4 align-middle text-sm font-medium text-typo-primary">
                {value}
            </td>
            <td className="py-4 pl-4 text-right align-middle">
                <Button
                    variant="empty"
                    className="w-max !min-w-0 !p-0"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <Check className="h-5 w-5 text-typo-note" />
                    ) : (
                        <div className="size-5 text-icon-main">
                            <IconCoppy />
                        </div>
                    )}
                </Button>
            </td>
        </tr>
    );
};

const manualPaymentProofSchema = z.object({
    proof: z
        .union([
            z.instanceof(File, { message: "Payment proof is required" }),
            z.string().refine(
                (val) => {
                    if (val?.startsWith("blob:") || val?.startsWith("https://"))
                        return true;
                    return false;
                },
                {
                    message: "Invalid image",
                }
            ),
        ])
        .refine(
            (val) => {
                if (val instanceof File) {
                    return val.size <= 5 * 1024 * 1024;
                }
                return true;
            },
            {
                message: "File size must be less than 5 MB",
            }
        ),
    notes: z
        .string()
        .max(500, { message: "Notes must be 500 characters or fewer" })
        .optional(),
});

type ManualPaymentProofFormValues = z.infer<typeof manualPaymentProofSchema>;

export const ManualPaymentProofForm: React.FC<{
    onPayLater?: () => void;
    isRejected?: boolean;
    rejectionReason?: string | null;
}> = ({ onPayLater, isRejected, rejectionReason }) => {
    const { sessionId, statusTransaction } = useCheckout();
    const queryClient = useQueryClient();
    const proofFileRef = useRef<File | null>(null);

    const hasPreviousSubmission =
        Boolean(statusTransaction?.manualPaymentEvidenceUrl) ||
        Boolean(statusTransaction?.manualPaymentStatus) ||
        Boolean(statusTransaction?.paymentDetails?.manualPaymentStatus) ||
        statusTransaction?.status === CHECKOUT_STATUS.INVOICE_SUBMITTED;

    const form = useForm<ManualPaymentProofFormValues>({
        resolver: zodResolver(manualPaymentProofSchema),
        mode: "onChange",
        defaultValues: {
            proof: undefined,
            notes: "",
        },
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const proofValue = form.watch("proof");
    const isSubmitDisabled = useMemo(
        () => isSubmitting || !proofValue,
        [isSubmitting, proofValue]
    );
    const createInvoiceSecretMutation = useMutation({
        mutationFn: () =>
            checkoutServices.createInvoiceSecret(
                sessionId!,
                CHECKOUT_PAYMENT_METHOD.MANUAL_TRANSFER
            ),
        mutationKey: [CHECKOUT_KEYS.CREATE_INVOICE_SECRET, sessionId],
    });

    const uploadEvidenceMutation = useMutation({
        mutationFn: ({
            checkoutSessionId,
            file,
            notes,
        }: {
            checkoutSessionId: string;
            file: File | Blob;
            notes?: string;
        }) =>
            checkoutServices.uploadManualPaymentEvidence(
                checkoutSessionId,
                file,
                notes
            ),
        mutationKey: [CHECKOUT_KEYS.UPLOAD_MANUAL_PAYMENT_EVIDENCE, sessionId],
    });

    const resubmitEvidenceMutation = useMutation({
        mutationFn: ({
            checkoutSessionId,
            file,
            notes,
        }: {
            checkoutSessionId: string;
            file: File | Blob;
            notes?: string;
        }) =>
            checkoutServices.resubmitManualPaymentEvidence(
                checkoutSessionId,
                file,
                notes
            ),
        mutationKey: [
            CHECKOUT_KEYS.RESUBMIT_MANUAL_PAYMENT_EVIDENCE,
            sessionId,
        ],
    });

    const onSubmit = async (values: ManualPaymentProofFormValues) => {
        if (!sessionId) {
            toast.error("Checkout session not found.");
            return;
        }

        try {
            setIsSubmitting(true);

            // Use File object from ref if available, otherwise use the value
            const fileToUpload =
                proofFileRef.current ||
                (values.proof instanceof File ? values.proof : null);

            if (!fileToUpload) {
                toast.error("Please upload a payment proof file.");
                return;
            }

            if (isRejected || hasPreviousSubmission) {
                try {
                    await resubmitEvidenceMutation.mutateAsync({
                        checkoutSessionId: sessionId,
                        file: fileToUpload,
                        notes: values.notes,
                    });
                } catch (resubmitErr: unknown) {
                    const err = resubmitErr as {
                        status?: number;
                        response?: { status?: number };
                        statusCode?: number;
                    };
                    const statusCode =
                        err?.status || err?.response?.status || err?.statusCode;
                    if (statusCode === 404) {
                        await uploadEvidenceMutation.mutateAsync({
                            checkoutSessionId: sessionId,
                            file: fileToUpload,
                            notes: values.notes,
                        });
                    } else {
                        throw resubmitErr;
                    }
                }
                toast.success("Payment proof resubmitted successfully.");
            } else {
                try {
                    await createInvoiceSecretMutation.mutateAsync();
                } catch {
                    // Ignore if already created
                }
                await uploadEvidenceMutation.mutateAsync({
                    checkoutSessionId: sessionId,
                    file: fileToUpload,
                    notes: values.notes,
                });
                toast.success("Payment proof uploaded successfully.");
            }

            queryClient.invalidateQueries({
                queryKey: [CHECKOUT_KEYS.GET_STATUS_SESSION, sessionId],
            });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            // Clear file ref and reset form after successful upload
            proofFileRef.current = null;
            form.reset();
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Unable to upload payment proof. Please try again."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 mb:gap-6"
            >
                {isRejected && (
                    <div className="flex flex-col gap-3 rounded-lg border border-bd-main p-4 text-sm">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="size-4 shrink-0 stroke-[1.5] text-typo-primary" />
                                <span className="text-base font-semibold text-typo-primary">
                                    Payment Proof Rejected
                                </span>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-typo-primary">
                                ACTION REQUIRED
                            </span>
                        </div>
                        <div className="rounded-md border border-bd-main p-3 text-sm leading-normal text-typo-primary">
                            <span className="font-semibold text-typo-primary">
                                Reason from Admin:{" "}
                            </span>
                            {rejectionReason ||
                                "Your previous payment proof was rejected. Please upload a clear transfer confirmation image."}
                        </div>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="proof"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                <FormImageUpload<ManualPaymentProofFormValues>
                                    maxFiles={1}
                                    accept={{
                                        "image/*": [".png", ".jpg", ".jpeg"],
                                    }}
                                    placeholder="Click to upload"
                                    helperText={".png or .jpg only\n(max 5MB)"}
                                    isCustomHelperText={true}
                                    required
                                    form={form}
                                    fieldName="proof"
                                    isLoading={
                                        uploadEvidenceMutation.isPending ||
                                        resubmitEvidenceMutation.isPending
                                    }
                                    trashOnly
                                    onValueChange={(files) => {
                                        if (files?.length) {
                                            const file = files[0] as File;
                                            proofFileRef.current = file;
                                            field.onChange(file);
                                        } else {
                                            proofFileRef.current = null;
                                            field.onChange(null);
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
                    name="notes"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-typo-primary">
                                Notes (optional)
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Add payment reference, message or additional details"
                                    className="min-h-[90px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-1 mb:w-full mb:justify-start">
                    {onPayLater && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onPayLater}
                            className="mb:min-w-0 mb:flex-1"
                        >
                            Pay later
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="action"
                        className="min-w-[10rem] mb:min-w-0 mb:flex-1"
                        disabled={isSubmitDisabled}
                    >
                        {isSubmitting ? "Submitting..." : "Confirm payment"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
