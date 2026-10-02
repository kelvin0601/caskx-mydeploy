"use client";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn, getErrorMessage } from "@/lib/utils";
import { CHECKOUT_STATUS } from "@/enum/checkout";
import { checkoutServices } from "@/services/checkout";
import docusignServices from "@/services/docusign";
import { transaction } from "@/types/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { getAgreementState } from "../agreement-status";

type AgreementReviewSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactions: transaction.TTransaction[];
    userId: string;
    agreementType?: string | null;
    buyerDocuSignAdminSignedAt?: string | null;
    sessionStatus?: CHECKOUT_STATUS;
    onReject: (payload: {
        reason: string;
        transactionId: string;
    }) => Promise<unknown>;
    onApprove: (transactionId: string) => Promise<unknown>;
    onSign: () => Promise<unknown>;
    isActionLoading: boolean;
    showActions?: boolean;
    checkoutSessionId?: string | null;
    onRequestUpdate?: ({
        reason,
        transactionIds,
    }: {
        reason: string;
        transactionIds: string[];
    }) => void;
    onRequestUpdateSuccess?: () => void;
};

export default function AgreementReviewSheet({
    open,
    onOpenChange,
    transactions,
    userId,
    agreementType,
    buyerDocuSignAdminSignedAt,
    sessionStatus,
    onReject,
    onApprove,
    onSign,
    isActionLoading,
    showActions = false,
    checkoutSessionId,
    onRequestUpdate,
    onRequestUpdateSuccess,
}: AgreementReviewSheetProps) {
    console.log("transactions_________", transactions);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [requestUpdateOpen, setRequestUpdateOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    const rejectSchema = z.object({
        reason: z.string().min(1, "Please enter a note to buyer."),
    });
    type RejectValues = z.infer<typeof rejectSchema>;
    const rejectForm = useForm<RejectValues>({
        resolver: zodResolver(rejectSchema),
        defaultValues: { reason: "" },
    });

    const requestUpdateSchema = z.object({
        reason: z.string().min(1, "Please enter a note to buyer."),
    });
    type RequestUpdateValues = z.infer<typeof requestUpdateSchema>;
    const requestUpdateForm = useForm<RequestUpdateValues>({
        resolver: zodResolver(requestUpdateSchema),
        defaultValues: { reason: "" },
    });

    // const currentId = agreementIds[currentIndex] ?? agreementIds[0];
    const hasMultiple = transactions.length > 1;
    const currentTransaction = transactions[currentIndex];
    const currentAgreementState = currentTransaction
        ? getAgreementState(
              currentTransaction,
              agreementType,
              buyerDocuSignAdminSignedAt,
              sessionStatus
          )
        : null;

    const requestUpdateMutation = useMutation({
        mutationFn: async ({
            reason,
            transactionIds,
        }: {
            reason: string;
            transactionIds: string[];
        }) => {
            if (checkoutSessionId) {
                await checkoutServices.requestUpdateBuyerAgreement(
                    checkoutSessionId,
                    reason,
                    transactionIds
                );
                return;
            }
            if (onRequestUpdate) {
                onRequestUpdate({
                    reason: reason,
                    transactionIds: transactionIds,
                });
                return;
            }
            toast.info("Request Update: no session id provided");
        },
        onSuccess: () => {
            toast.success("Update requested successfully");
            setRequestUpdateOpen(false);
            requestUpdateForm.reset();
            onRequestUpdateSuccess?.();
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Request update failed"));
        },
    });

    const fetchDocumentMutation = useMutation({
        mutationFn: (envelopeId: string) =>
            docusignServices.getDocuments(envelopeId),
        onSuccess: (data) => {
            if (data instanceof Blob) {
                const url = window.URL.createObjectURL(data);
                setPreviewUrl(url);
            } else if (typeof data === "string") {
                setPreviewUrl(data);
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to load agreement"));
        },
    });

    const { mutate: fetchDocument } = fetchDocumentMutation;

    useEffect(() => {
        const evenlopId =
            transactions[currentIndex]?.buyerDocuSignEnvelopeId ||
            transactions[currentIndex]?.sellerAgreementDocuSignEnvelopeId;
        if (open && evenlopId) {
            setPreviewUrl(null);
            fetchDocument(evenlopId as string);
        }
    }, [open, transactions, currentIndex, fetchDocument]);

    useEffect(() => {
        if (!open && previewUrl && previewUrl?.startsWith("blob:")) {
            window.URL.revokeObjectURL(previewUrl);
        }
        if (!open) setPreviewUrl(null);
    }, [open, previewUrl]);

    const handlePrev = () => {
        setCurrentIndex((i) => Math.max(0, i - 1));
    };

    const handleNext = () => {
        setCurrentIndex((i) => Math.min(transactions.length - 1, i + 1));
    };

    return (
        <>
            <Sheet
                open={rejectDialogOpen || requestUpdateOpen ? false : open}
                onOpenChange={onOpenChange}
            >
                <SheetContent
                    side="right"
                    className="flex w-full max-w-none flex-col gap-0 overflow-hidden border-l border-bd-brown bg-bg-main p-0 sm:max-w-4xl"
                >
                    <SheetHeader className="flex flex-row items-center justify-between border-b border-bd-brown px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                            <SheetTitle className="text-left text-base font-semibold capitalize text-typo-primary">
                                {transactions[currentIndex]?.agreementType}
                            </SheetTitle>
                            <span className="text-sm text-typo-note">
                                {userId}
                            </span>
                        </div>
                    </SheetHeader>

                    {/* Navigation */}
                    {hasMultiple && (
                        <div className="flex flex-row items-center justify-between border-b border-bd-brown px-6 py-2">
                            <div className="text-xs font-semibold uppercase tracking-wider text-typo-note">
                                Agreements ({transactions.length})
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-typo-note">
                                    Agreement {currentIndex + 1}/
                                    {transactions.length}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleNext}
                                    disabled={
                                        currentIndex === transactions.length - 1
                                    }
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-1 overflow-hidden">
                        {/* Agreement list sidebar */}
                        <div className="w-56 shrink-0 border-r border-bd-brown bg-bg-sf1 p-4">
                            {transactions.map((transaction, idx) => (
                                <div
                                    key={transaction.id}
                                    className={cn(
                                        "mb-3 cursor-pointer rounded-lg border px-3 py-2 transition-colors",
                                        idx === currentIndex
                                            ? "border-brand bg-brand/5"
                                            : "border-transparent hover:bg-bg-main"
                                    )}
                                    onClick={() => setCurrentIndex(idx)}
                                >
                                    <div className="line-clamp-1 text-sm font-medium text-typo-primary">
                                        {transaction?.buyerDocuSignEnvelopeId}
                                    </div>
                                    <div className="text-xs text-typo-note">
                                        {userId}
                                    </div>
                                    <Badge
                                        variant={
                                            getAgreementState(
                                                transaction,
                                                agreementType,
                                                buyerDocuSignAdminSignedAt,
                                                sessionStatus
                                            ).variant
                                        }
                                        className="mt-1.5 text-xs"
                                    >
                                        {
                                            getAgreementState(
                                                transaction,
                                                agreementType,
                                                buyerDocuSignAdminSignedAt,
                                                sessionStatus
                                            ).label
                                        }
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        {/* Document preview */}
                        <div className="flex flex-1 flex-col overflow-hidden">
                            {fetchDocumentMutation.isPending ? (
                                <div className="flex flex-1 items-center justify-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                                        <span className="text-sm text-typo-note">
                                            Loading agreement...
                                        </span>
                                    </div>
                                </div>
                            ) : previewUrl ? (
                                <iframe
                                    src={previewUrl}
                                    title="Agreement preview"
                                    className="h-full w-full flex-1 border-0"
                                />
                            ) : (
                                <div className="flex flex-1 items-center justify-center text-sm text-typo-note">
                                    Unable to load document
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    {showActions && currentAgreementState?.canReview && (
                        <div className="flex w-full justify-end gap-3 border-t border-bd-brown px-6 py-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    rejectForm.reset();
                                    setRejectDialogOpen(true);
                                }}
                                disabled={isActionLoading}
                            >
                                Reject Agreement
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    requestUpdateForm.reset();
                                    setRequestUpdateOpen(true);
                                }}
                                disabled={isActionLoading}
                            >
                                Request Update
                            </Button>
                            {agreementType === "indirect" ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        void onSign().catch(() => undefined);
                                    }}
                                    disabled={isActionLoading}
                                >
                                    Sign Agreement
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        void onApprove(
                                            transactions[currentIndex].id
                                        ).catch(() => undefined);
                                    }}
                                    disabled={isActionLoading}
                                >
                                    Approve Agreement
                                </Button>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Reject Agreement dialog */}
            <Form {...rejectForm}>
                <AlertDialog
                    open={rejectDialogOpen}
                    onOpenChange={(open) => {
                        setRejectDialogOpen(open);
                        if (!open) rejectForm.reset();
                    }}
                >
                    <AlertDialogContent className="sm:max-w-md">
                        <AlertDialogHeader className="space-y-2 text-left">
                            <AlertDialogTitle>
                                Reject Agreement
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Rejecting this agreement will terminate the full
                                order.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <form
                            onSubmit={rejectForm.handleSubmit(async (data) => {
                                try {
                                    await onReject({
                                        reason: data.reason,
                                        transactionId:
                                            transactions[currentIndex].id,
                                    });
                                    setRejectDialogOpen(false);
                                    rejectForm.reset();
                                } catch {
                                    // The mutation reports the request error.
                                }
                            })}
                            className="space-y-4"
                        >
                            <FormField
                                control={rejectForm.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note to Buyer *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter a description..."
                                                className="min-h-[5rem] resize-none"
                                                disabled={isActionLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <AlertDialogFooter className="flex gap-3 sm:justify-center">
                                <AlertDialogCancel type="button">
                                    Cancel
                                </AlertDialogCancel>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    disabled={isActionLoading}
                                >
                                    Confirm Rejection
                                </Button>
                            </AlertDialogFooter>
                        </form>
                    </AlertDialogContent>
                </AlertDialog>
            </Form>

            {/* Request Update dialog */}
            <Form {...requestUpdateForm}>
                <AlertDialog
                    open={requestUpdateOpen}
                    onOpenChange={(open) => {
                        setRequestUpdateOpen(open);
                        if (!open) requestUpdateForm.reset();
                    }}
                >
                    <AlertDialogContent className="sm:max-w-md">
                        <AlertDialogHeader className="space-y-2 text-left">
                            <AlertDialogTitle>Request Update</AlertDialogTitle>
                            <AlertDialogDescription>
                                The buyer will be notified to revise their
                                agreement based on your feedback.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <form
                            onSubmit={requestUpdateForm.handleSubmit((data) =>
                                requestUpdateMutation.mutate({
                                    reason: data.reason,
                                    transactionIds: [
                                        transactions[currentIndex].id,
                                    ],
                                })
                            )}
                            className="space-y-4"
                        >
                            <FormField
                                control={requestUpdateForm.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note to Buyer *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter a description..."
                                                className="min-h-[5rem] resize-none"
                                                disabled={
                                                    isActionLoading ||
                                                    requestUpdateMutation.isPending
                                                }
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <AlertDialogFooter className="flex gap-3 sm:justify-center">
                                <AlertDialogCancel type="button">
                                    Cancel
                                </AlertDialogCancel>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    disabled={
                                        isActionLoading ||
                                        requestUpdateMutation.isPending
                                    }
                                >
                                    {requestUpdateMutation.isPending
                                        ? "Submitting..."
                                        : "Request Update"}
                                </Button>
                            </AlertDialogFooter>
                        </form>
                    </AlertDialogContent>
                </AlertDialog>
            </Form>
        </>
    );
}
