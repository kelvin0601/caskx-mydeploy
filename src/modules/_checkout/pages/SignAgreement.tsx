"use client";

import HeadingSettings from "@/components/shared/heading-settings";
import IconDocusign from "@/components/shared/icons/icon-docusign";
import { Button } from "@/components/ui/button";
import { EDocuSignStatus } from "@/enum/docusign";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { formatDateTime, getErrorMessage, downloadFile } from "@/lib/utils";
import { checkoutServices } from "@/services/checkout";
import { useBoundStore } from "@/store";
import { useCheckout } from "@/store/checkout";
import { transaction } from "@/types/transaction";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import PaymentSummary from "../payment-summary";
import TableInfoTransaction from "../table-info-transaction";
import { AxiosError } from "axios";

export default function SignAgreement() {
    const { statusTransaction, sessionId } = useCheckout();
    const { user } = useBoundStore();

    const signAgreementQuery = useQuery({
        queryKey: [CHECKOUT_KEYS.SIGN_AGREEMENT, sessionId],
        queryFn: () =>
            checkoutServices.signAgreement({
                checkoutSessionId: sessionId,
                signature: `${user?.firstName} ${user?.lastName}`,
                agreementAccepted: true,
            }),
        enabled: !!sessionId && !!user,
    });

    const isDirectSigned = !!signAgreementQuery.data?.agreements;
    const transactions = statusTransaction?.transactions;

    const transactionsWithAgreement = useMemo(() => {
        if (!isDirectSigned || !transactions) return transactions;

        return transactions.map((t) => {
            const found = signAgreementQuery.data?.agreements?.find(
                (a) => a.transactionId === t.id
            );
            return {
                ...t,
                agreementSignUrl: found?.signingUrl || null,
            };
        });
    }, [isDirectSigned, transactions, signAgreementQuery.data?.agreements]);

    return (
        <div className="flex flex-col">
            <HeadingSettings
                className="mb-5 border-b-[1px] border-bd-brown pb-5"
                title="Purchasing agreement"
                description="Please review your purchasing agreement carefully before signing."
            />
            <TableInfoTransaction
                isDeposited={true}
                title="About your match"
                className="rounded-md bg-bg-sf1 px-6 py-12 tb:py-8 mb:px-4 mb:py-6"
            >
                {isDirectSigned && (
                    <PaymentSummary
                        isDirectSigned={isDirectSigned}
                        transactions={
                            transactionsWithAgreement as (transaction.TTransaction & {
                                agreementSignUrl: string | null;
                            })[]
                        }
                        setTransactionIdNotSigned={() => {}}
                        processingFeePercent={
                            statusTransaction?.processingFeePercent || 0
                        }
                    />
                )}
                <DocusignBanner
                    signAgreementQuery={signAgreementQuery}
                    isDirectSigned={isDirectSigned}
                />
            </TableInfoTransaction>
        </div>
    );
}

type DocusignBannerProps = {
    signAgreementQuery: UseQueryResult<
        {
            success: boolean;
            nextStep: string;
            signingUrl?: string;
            agreements?:
                | {
                      transactionId: string;
                      envelopeId: string;
                      signingUrl: string;
                      status: string;
                  }[]
                | undefined;
            completed: boolean;
        },
        {
            status: number;
            statusCode: number;
            message: string;
            data: unknown;
        }
    >;
    isDirectSigned: boolean;
};

const DocusignBanner = ({
    signAgreementQuery,
    isDirectSigned,
}: DocusignBannerProps) => {
    const { sessionId, setPopupCurrent, setIsOpenPopup, statusTransaction } =
        useCheckout();
    const [isProcessing, setIsProcessing] = useState(false);

    const getDocusignUrl = useMutation({
        mutationFn: (id: string) => checkoutServices.regenerateAgreement(id),
        mutationKey: [CHECKOUT_KEYS.REGENERATE_AGREEMENT, sessionId],
    });

    const handleSignLater = () => {
        setPopupCurrent({
            title: `Agreement Signing Due: ${formatDateTime(statusTransaction?.expiryDate).dateOnly}`,
            description:
                "Please sign your agreement by this date to secure your cask.",
            buttonText: "Sign now",
            status: "signature",
        });
        setIsOpenPopup(true);
    };

    const handleSignAgreement = async () => {
        if (!sessionId) {
            toast.error("Checkout session not found");
            return;
        }

        setIsProcessing(true);
        try {
            const signingUrl = signAgreementQuery.data?.signingUrl;

            if (signingUrl) {
                downloadFile(signingUrl);
                return;
            }

            // Fallback: try to regenerate agreement URL
            const res = await getDocusignUrl.mutateAsync(sessionId);
            if (res?.signingUrl) {
                downloadFile(res.signingUrl);
            } else {
                throw new Error("Failed to retrieve signing URL");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to sign agreement"));
        } finally {
            setIsProcessing(false);
        }
    };

    const isPending =
        signAgreementQuery.isLoading ||
        getDocusignUrl.isPending ||
        isProcessing;
    const isSignedByBuyer =
        statusTransaction?.buyerDocuSignStatus === EDocuSignStatus.BUYER_SEND;

    return (
        <div className="flex flex-col items-start justify-between gap-4 rounded-lg md:flex-row mb:gap-3">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-[3.75rem] items-center justify-center rounded-md bg-bg-main">
                    <div className="w-12">
                        <IconDocusign />
                    </div>
                </div>
                <p className="text-sm text-typo-soft">
                    Cask Exchange uses DocuSign for document processing and
                    e-signatures.
                </p>
            </div>
            <div className="flex items-center gap-3 self-end md:self-auto mb:w-full">
                <Button
                    variant="outline"
                    onClick={handleSignLater}
                    className="mb:w-full"
                >
                    Sign later
                </Button>
                {!isDirectSigned && (
                    <Button
                        variant="secondary"
                        onClick={handleSignAgreement}
                        className="disabled:bg-bg-sf2 mb:w-full"
                        disabled={isPending}
                    >
                        {isPending
                            ? "Signing..."
                            : isSignedByBuyer
                              ? "Signed by Buyer"
                              : "Sign Agreement"}
                    </Button>
                )}
            </div>
        </div>
    );
};
