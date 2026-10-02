"use client";

import HeadingSettings from "@/components/shared/heading-settings";
import IconStripe from "@/components/shared/icons/icon-stripe";
import LinkCustom from "@/components/shared/link-custom";
import { Button } from "@/components/ui/button";
import { EDocuSignStatus } from "@/enum/docusign";
import { useStripePayouts } from "@/hooks/useStripePayouts";
import { KEY_TRANSACTIONS, ROUTE_PUBLIC } from "@/lib/constants";
import caskTransactionsService from "@/services/cask-transactions";
import { useBoundStore } from "@/store";
import { payout } from "@/types/payout";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import PayoutDetailsCard from "../payout-details-card";
import PayoutSummary from "../payout-summary";
import TableInfoTransaction from "../table-info-transaction";
import { transaction } from "@/types/transaction";

export default function ListedForSale({
    data,
    transactionId,
}: {
    data: payout.TAskTransactionPayoutResponse;
    transactionId?: string;
}) {
    const [transactionIdNotSigned, setTransactionIdNotSigned] = useState<
        string | null
    >(null);

    const { data: transactionDetail } = useQuery({
        queryKey: [KEY_TRANSACTIONS.ASKS, transactionIdNotSigned],
        queryFn: () =>
            caskTransactionsService.getTransactionDetailClient(
                transactionIdNotSigned as string
            ),
        refetchInterval: (query) => {
            // Check if we should stop polling based on current data
            if (!transactionIdNotSigned) return false;

            // Get merged data to check transaction status
            const mergedData = { ...data, ...query.state.data };
            const allTransactions = mergedData.transactions || [];
            const targetTransaction = allTransactions.find(
                (t) => t.askId === transactionIdNotSigned
            );

            // Stop interval if transaction is signed
            if (
                targetTransaction?.sellerAgreementStatus !==
                EDocuSignStatus.AWAITING_SIGNATURE
            ) {
                return false; // Stop polling
            }

            return 5000; // Continue polling
        },
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: true,
        staleTime: 5000,
        enabled: !!transactionIdNotSigned,
    });

    const dataMatched = { ...data, ...transactionDetail };
    const { user } = useBoundStore();
    const { data: stripePayouts } = useStripePayouts(user?.stripeAccount?.id, {
        enabled: !!user,
    });
    const transactions = useMemo(() => {
        return transactionId
            ? dataMatched.transactions.filter(
                  (item) => item.id === transactionId
              )
            : dataMatched.transactions || [];
    }, [dataMatched.transactions, transactionId]);
    const askSummary = dataMatched.ask;
    // Get default bank account or first available
    const defaultBankAccount = useMemo(() => {
        const accounts = stripePayouts?.payouts?.externalAccounts || [];
        if (accounts.length === 0) return null;

        // Find default account (if default field exists) or use first one
        const defaultAccount = accounts.find((acc) => acc.default === true);
        return defaultAccount || accounts[0];
    }, [stripePayouts?.payouts?.externalAccounts]);

    // Format card number with last4
    const formattedCardNumber = useMemo(() => {
        if (!defaultBankAccount?.last4) return undefined;
        return `**** **** **** ${defaultBankAccount.last4}`;
    }, [defaultBankAccount?.last4]);

    return (
        <div>
            <HeadingSettings
                className="mb-12 border-b-[1px] border-bd-brown pb-5"
                title="Listed For Sale"
                description="Your listings are live and will update as matches occur."
            />
            <div className="rounded-md bg-bg-sf1 px-6 py-12 tb:py-0 mb:px-4">
                <div className="flex flex-col gap-8">
                    <TableInfoTransaction
                        title="Ask Details"
                        caskName={`${data?.ask?.cask?.master?.name} - ${data?.ask?.cask?.name}`}
                        // askPrice={askSummary.askPrice}
                        estTotalValue={dataMatched.estimatedSellerPayout || 0}
                        currentTotalValue={dataMatched.currentSellerPayout || 0}
                        dueDateLabel="Ask Expiration Date"
                        totalUnpaid={dataMatched.unpaidSellerPayout || 0}
                        totalPaid={dataMatched.totalPaidSeller || 0}
                        totalQuantity={askSummary?.quantity}
                        dueDate={askSummary?.expirationDate.toString()}
                        caskInfo={data?.ask?.cask}
                    >
                        <div className="flex flex-col gap-8 tb:gap-6 tb:py-8 mb:gap-5 mb:py-6">
                            {transactions.length > 0 && (
                                <>
                                    <h2 className="text-2xl font-semibold text-typo-primary">
                                        Payout Details
                                    </h2>
                                    <PayoutSummary
                                        processingFeeRate={
                                            dataMatched.processingFeeRate
                                        }
                                        setTransactionIdNotSigned={
                                            setTransactionIdNotSigned
                                        }
                                        transactions={transactions}
                                    />
                                </>
                            )}

                            <PayoutDetailsCard
                                bankName={defaultBankAccount?.bankName}
                                cardNumber={formattedCardNumber}
                                onEdit={() => {
                                    window.open(
                                        ROUTE_PUBLIC.STRIPE_ONBOARDING,
                                        "_blank"
                                    );
                                }}
                            />
                            <div className="flex flex-row items-center justify-between mb:flex-col mb:gap-4">
                                <div className="flex flex-row items-center gap-2">
                                    <div className="rounded-[0.3125rem] bg-bg-main">
                                        <div className="w-8 [&_path]:fill-[#635BFF]">
                                            <IconStripe />
                                        </div>
                                    </div>
                                    <div className="text-sm text-typo-soft">
                                        Cask Exchange uses Stripe for processing
                                        payments.
                                    </div>
                                </div>

                                <div className="flex flex-row gap-3 mb:w-full mb:flex-col">
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="bg-bg-main mb:w-full"
                                    >
                                        <LinkCustom href={ROUTE_PUBLIC.HOME}>
                                            Back To Homepage
                                        </LinkCustom>
                                    </Button>
                                    <Button
                                        asChild
                                        disabled={false}
                                        className="disabled:bg-bg-sf2 mb:w-full"
                                        variant="secondary"
                                    >
                                        <LinkCustom
                                            href={ROUTE_PUBLIC.MANAGE_ASKS}
                                        >
                                            Manage My Asks
                                        </LinkCustom>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TableInfoTransaction>
                </div>
            </div>
        </div>
    );
}
