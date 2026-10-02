"use client";

import React from "react";
import Image from "next/image";
import CaskInfoStats from "@/components/shared/cask-info-stats";
import { formatCurrency, isCheckoutStatusTerminal } from "@/lib/utils";
import { checkout } from "@/types/checkout";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { InputWithoutForm } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CHECKOUT_STEP } from "@/enum/checkout";
import { ScrollArea } from "@/components/ui/scroll-area";

type TCaskSummarySidebarProps = {
    status: checkout.TTransactionStatus;
};

function PaymentBreakdownDetails({
    status,
}: {
    status: checkout.TTransactionStatus;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <span className="text-sm text-typo-soft">Cask subtotal</span>
                <span className="text-sm font-semibold text-typo-primary">
                    {formatCurrency(Number(status.originalAmount || 0))}
                </span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-typo-soft">
                    Processing fee ({status.processingFeePercent || 5}%)
                </span>
                <span className="text-sm font-semibold text-typo-primary">
                    {formatCurrency(Number(status.processingFeeAmount || 0))}
                </span>
            </div>
        </div>
    );
}

function DiscountField() {
    return (
        <div className="relative w-full">
            <InputWithoutForm
                aria-label="Discount code"
                placeholder="Enter discount code"
                className="tb:h-12 mb:h-10"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Button variant="link" className="tb:!leading-none">
                    Apply
                </Button>
            </div>
        </div>
    );
}

export default function CaskSummarySidebar({
    status,
}: TCaskSummarySidebarProps) {
    const caskData = status.cask;
    if (!caskData) return null;

    const currentStep = status?.currentStep?.split("_").join("-") as
        | CHECKOUT_STEP
        | undefined;
    return (
        <div className="sticky top-[4rem] flex h-[90vh] flex-col pt-6 tb:static tb:h-auto tb:pt-0">
            <ScrollArea className="scroll-wrap mr-3 pr-0 tb:hidden">
                <div className="flex h-max flex-1 flex-col pr-3">
                    {caskData.imageUrl && (
                        <div className="relative aspect-square w-full border bg-bg-sf1">
                            <Image
                                src={caskData.imageUrl}
                                alt={caskData.name || "Cask Graphic"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 25vw"
                                priority
                            />
                        </div>
                    )}
                    {/* 1. Cask Image (Always Visible) */}
                    <Accordion
                        type="single"
                        collapsible
                        defaultValue="cask-info"
                        className="w-full"
                    >
                        <AccordionItem
                            value="cask-info"
                            className="group border-none"
                        >
                            <AccordionTrigger className="pb-6 text-left data-[state=open]:pb-5">
                                <span className="font-reckless text-xl font-medium text-typo-primary">
                                    {caskData?.master?.name}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6">
                                <CaskInfoStats caskData={caskData} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </ScrollArea>

            <div className="relative -ml-6 flex flex-shrink-0 flex-col overflow-hidden border-t border-bd-main bg-bg-main pl-6 pr-6 tb:ml-0 tb:p-5 mb:p-4">
                <div className="tb:hidden">
                    <Accordion
                        type="single"
                        collapsible
                        defaultValue="payment-breakdown"
                        className="w-full"
                    >
                        <AccordionItem
                            value="payment-breakdown"
                            className="border-none"
                        >
                            <AccordionTrigger className="py-5 text-left data-[state=open]:pb-2">
                                <span className="text-sm font-semibold text-typo-primary">
                                    Payment breakdown
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6">
                                <div className="flex flex-col gap-2">
                                    <PaymentBreakdownDetails status={status} />
                                    {currentStep ===
                                        CHECKOUT_STEP.SELLER_CONFIRMATION && (
                                        <DiscountField />
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div className="hidden border-b border-bd-main pb-5 tb:block mb:pb-4">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem
                            value="payment-breakdown"
                            className="border-none"
                        >
                            <AccordionTrigger
                                className="py-0 text-left data-[state=open]:pb-2"
                                classNameChevron="size-5"
                            >
                                <span className="text-sm font-semibold text-typo-primary">
                                    Payment breakdown
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-0">
                                <PaymentBreakdownDetails status={status} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {currentStep === CHECKOUT_STEP.SELLER_CONFIRMATION &&
                        !isCheckoutStatusTerminal(status?.status) && (
                            <div className="mt-2">
                                <DiscountField />
                            </div>
                        )}
                </div>

                {/* Main Total Row (Always rendered, large text style) */}
                <div className="flex items-center justify-between border-t border-bd-main pb-2 pt-5 text-typo-primary tb:border-t-0 tb:pb-0 mb:pt-4">
                    <span className="text-sm font-semibold">
                        Total{" "}
                        {currentStep === CHECKOUT_STEP.OWNERSHIP_TRANSFER && (
                            <span className="font-normal text-typo-soft">
                                (paid)
                            </span>
                        )}
                    </span>
                    <span className="text-lg font-semibold tb:text-base">
                        {formatCurrency(Number(status.totalAmount || 0))}
                    </span>
                </div>

                {/* Sub-rows for Deposit or Remaining Balance based on checkout step */}
                {(currentStep === CHECKOUT_STEP.DEPOSIT_PAYMENT ||
                    currentStep === CHECKOUT_STEP.AGREEMENT_SIGNING ||
                    currentStep === CHECKOUT_STEP.INVOICE_PAYMENT) && (
                    <div className="flex flex-col gap-2 pb-5 text-xs tb:mt-1.5 tb:gap-1.5 tb:pb-0 mb:gap-2">
                        {currentStep === CHECKOUT_STEP.DEPOSIT_PAYMENT ? (
                            <div className="flex items-center justify-between text-typo-soft">
                                <span className="text-sm text-typo-soft">
                                    Deposit (10%)
                                </span>
                                <span className="text-sm font-semibold text-typo-primary">
                                    {formatCurrency(
                                        Number(status.depositAmount || 0)
                                    )}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between text-typo-soft">
                                    <span className="text-sm text-typo-soft">
                                        Deposit (10%){" "}
                                        <span className="j-tb:hidden">
                                            (Paid)
                                        </span>
                                    </span>
                                    <span className="text-sm font-semibold text-typo-primary">
                                        {formatCurrency(
                                            Number(status.depositAmount || 0)
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-typo-soft">
                                    <span className="text-sm text-typo-soft">
                                        Remaining amount
                                    </span>
                                    <span className="text-sm font-semibold text-typo-primary">
                                        {formatCurrency(
                                            Number(status.remainingAmount || 0)
                                        )}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
