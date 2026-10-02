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
import { Badge, TBadgeVariant } from "@/components/ui/badge";
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
import docusignServices from "@/services/docusign";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type PayoutAgreementReviewSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agreementIds: string[];
    /** Optional per-agreement document URLs (e.g. release form URLs) */
    documentUrls?: string[];
    userId: string;
    agreementType?: string | null;
    statusLabel: string;
    statusVariant: TBadgeVariant;
    onReject: (reason: string) => Promise<unknown>;
    onApprove: () => Promise<unknown>;
    onSign: () => Promise<unknown>;
    /** Called when user confirms "Request Update". */
    onRequestUpdate?: (note: string) => Promise<unknown>;
    isActionLoading: boolean;
    showActions?: boolean;
};

export default function PayoutAgreementReviewSheet({
    open,
    onOpenChange,
    agreementIds,
    documentUrls,
    userId,
    agreementType,
    statusLabel,
    statusVariant,
    onReject,
    onApprove,
    onSign,
    onRequestUpdate,
    isActionLoading,
    showActions = false,
}: PayoutAgreementReviewSheetProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [requestUpdateOpen, setRequestUpdateOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const rejectSchema = z.object({
        reason: z.string().min(1, "Please enter a note to seller."),
    });
    type RejectValues = z.infer<typeof rejectSchema>;
    const rejectForm = useForm<RejectValues>({
        resolver: zodResolver(rejectSchema),
        defaultValues: { reason: "" },
    });

    const requestUpdateSchema = z.object({
        reason: z.string().min(1, "Please enter a note to seller."),
    });
    type RequestUpdateValues = z.infer<typeof requestUpdateSchema>;
    const requestUpdateForm = useForm<RequestUpdateValues>({
        resolver: zodResolver(requestUpdateSchema),
        defaultValues: { reason: "" },
    });

    const currentId = agreementIds[currentIndex] ?? agreementIds[0];
    const currentDocUrl =
        documentUrls && documentUrls.length > 0
            ? (documentUrls[currentIndex] ?? documentUrls[0])
            : undefined;
    const hasMultiple = agreementIds.length > 1;

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
        if (!open) return;

        // Prefer backend-provided document URL when available
        if (currentDocUrl) {
            setPreviewUrl(currentDocUrl);
            return;
        }

        if (currentId) {
            setPreviewUrl(null);
            fetchDocument(currentId);
        }
    }, [open, currentId, currentDocUrl, fetchDocument]);

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
        setCurrentIndex((i) => Math.min(agreementIds.length - 1, i + 1));
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
                                {currentId}
                            </SheetTitle>
                            <span className="text-sm text-typo-note">
                                {userId}
                            </span>
                        </div>
                    </SheetHeader>

                    {hasMultiple && (
                        <div className="flex items-center justify-center gap-2 border-b border-bd-brown px-6 py-2">
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
                                {agreementIds.length}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleNext}
                                disabled={
                                    currentIndex === agreementIds.length - 1
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <div className="flex flex-1 overflow-hidden">
                        <div className="w-56 shrink-0 border-r border-bd-brown bg-bg-sf1 p-4">
                            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-typo-note">
                                Agreements ({agreementIds.length})
                            </div>
                            {agreementIds.map((id, idx) => (
                                <div
                                    key={id}
                                    className={cn(
                                        "mb-3 cursor-pointer rounded-lg border px-3 py-2 transition-colors",
                                        idx === currentIndex
                                            ? "border-brand bg-brand/5"
                                            : "border-transparent hover:bg-bg-main"
                                    )}
                                    onClick={() => setCurrentIndex(idx)}
                                >
                                    <div className="line-clamp-1 text-sm font-medium text-typo-primary">
                                        {id}
                                    </div>
                                    <div className="text-xs text-typo-note">
                                        {userId}
                                    </div>
                                    <Badge
                                        variant={statusVariant}
                                        className="mt-1.5 text-xs"
                                    >
                                        {statusLabel}
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        <div className="flex w-full flex-1 flex-col overflow-hidden">
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

                    {showActions && (
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
                                        void onApprove().catch(() => undefined);
                                    }}
                                    disabled={isActionLoading}
                                >
                                    Approve Agreement
                                </Button>
                            )}
                        </div>
                    )}
                </SheetContent>{" "}
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
                                    Rejecting this agreement will terminate the
                                    full order.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <form
                                onSubmit={rejectForm.handleSubmit(
                                    async (data) => {
                                        try {
                                            await onReject(data.reason);
                                            setRejectDialogOpen(false);
                                            rejectForm.reset();
                                        } catch {
                                            // The mutation reports the request error.
                                        }
                                    }
                                )}
                                className="space-y-4"
                            >
                                <FormField
                                    control={rejectForm.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Note to Seller *
                                            </FormLabel>
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
                                <AlertDialogTitle>
                                    Request Update
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    The seller will be notified to revise their
                                    agreement based on your feedback.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <form
                                onSubmit={requestUpdateForm.handleSubmit(
                                    async (data) => {
                                        try {
                                            await onRequestUpdate?.(
                                                data.reason
                                            );
                                            setRequestUpdateOpen(false);
                                            requestUpdateForm.reset();
                                        } catch {
                                            // The mutation reports the request error.
                                        }
                                    }
                                )}
                                className="space-y-4"
                            >
                                <FormField
                                    control={requestUpdateForm.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Note to Seller *
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter a description..."
                                                    className="min-h-[5rem] resize-none"
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
                                        Request Update
                                    </Button>
                                </AlertDialogFooter>
                            </form>
                        </AlertDialogContent>
                    </AlertDialog>
                </Form>
            </Sheet>
        </>
    );
}
