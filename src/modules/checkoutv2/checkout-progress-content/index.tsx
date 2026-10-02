"use client";

import CaskInfoDrawer from "@/components/shared/cask-info-drawer";
import IconCheckCir from "@/components/shared/icons/icon-check-cir";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { cn, formatDateTime } from "@/lib/utils";
import { checkout } from "@/types/checkout";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";

import { CHECKOUT_STATUS } from "@/enum/checkout";

type TStepNode = {
    title: string;
    slug: string;
};

const STEPS: TStepNode[] = [
    { title: "Seller Confirmation", slug: "seller-confirmation" },
    { title: "Deposit Payment", slug: "deposit-payment" },
    { title: "Agreement Signing", slug: "agreement-signing" },
    { title: "Payment Completion", slug: "invoice-payment" },
    { title: "Ownership Transfer", slug: "ownership-transfer" },
];

type TCheckoutProgressContentProps = {
    children: React.ReactNode;
    statusCheckout: checkout.TTransactionStatus;
};

export default function CheckoutProgressContent({
    children,
    statusCheckout,
}: TCheckoutProgressContentProps) {
    const pathname = usePathname();
    const [isCaskInfoOpen, setIsCaskInfoOpen] = useState(false);

    // Determine the active index based on active route slug
    const activeIdx = useMemo(() => {
        const matchingIndex = STEPS.findIndex((step) =>
            pathname.endsWith(step.slug)
        );
        return matchingIndex !== -1 ? matchingIndex : 0;
    }, [pathname]);

    const caskData = statusCheckout.cask;
    const createdAtDate = statusCheckout.transactions?.[0]?.createdAt;
    const formattedCreatedAt = createdAtDate
        ? formatDateTime(createdAtDate)
        : null;
    const isCheckoutCompleted =
        statusCheckout?.status === CHECKOUT_STATUS.COMPLETED;

    return (
        <div
            className={cn(
                "col-span-12 flex min-w-0 flex-col gap-8 py-6 pl-2 tb:order-1 tb:col-span-6 tb:flex-1 tb:gap-5 tb:p-5 mb:col-span-4 mb:gap-4 mb:px-4 mb:py-6",
                activeIdx === 1 ? "tb:pb-6" : "tb:pb-5",
                activeIdx === 4 && "j-tb:gap-6 j-tb:p-6"
            )}
        >
            <div className="flex items-center justify-between tb:flex-col tb:items-stretch tb:gap-2">
                <div className="flex min-w-0 items-center gap-3 tb:justify-between">
                    <h2 className="min-w-0 truncate font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                        {caskData?.master?.name}
                    </h2>
                </div>
                <div className="flex items-center justify-between">
                    {formattedCreatedAt && (
                        <span className="text-sm font-medium text-typo-soft">
                            Created{" "}
                            <span className="font-medium text-typo-primary">
                                {formattedCreatedAt.dataOnlyNumber}
                            </span>{" "}
                            <span className="text-typo-soft">
                                {formattedCreatedAt.timeOnly24}
                            </span>
                        </span>
                    )}
                    <div className="hidden shrink-0 mb:block">
                        <Button
                            variant="link"
                            onClick={() => setIsCaskInfoOpen(true)}
                        >
                            View Cask info
                        </Button>
                    </div>
                </div>
            </div>

            <Carousel
                opts={{
                    align: "start",
                    dragFree: true,
                    startSnap: activeIdx,
                    breakpoints: {
                        "(min-width: 768px)": {
                            startSnap: Math.max(0, activeIdx - 2),
                        },
                        "(min-width: 1025px)": {
                            dragFree: false,
                            draggable: false,
                            startSnap: 0,
                        },
                    },
                }}
                className="w-full min-w-0 mb:mb-2"
                aria-label="Checkout progress"
            >
                <CarouselContent
                    className="w-full items-stretch"
                    classNameParent="no-scrollbar"
                >
                    {STEPS.map((step, idx) => {
                        const isCompleted =
                            idx < activeIdx ||
                            (isCheckoutCompleted && idx === STEPS.length - 1);
                        const isActive = idx === activeIdx && !isCompleted;

                        return (
                            <CarouselItem
                                key={step.slug}
                                className="flex basis-1/5 flex-col gap-3 pl-0 tb:basis-[15rem]"
                            >
                                <div className="flex items-center gap-2 pr-4">
                                    {isCompleted ? (
                                        <div className="size-4 shrink-0 text-success">
                                            <IconCheckCir />
                                        </div>
                                    ) : (
                                        <span
                                            className={cn(
                                                "flex size-4 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-semibold leading-none",
                                                isActive
                                                    ? "border border-typo-primary text-typo-primary"
                                                    : "border border-bd-main text-typo-soft"
                                            )}
                                        >
                                            {idx + 1}
                                        </span>
                                    )}
                                    <span
                                        className={cn(
                                            "truncate text-sm font-medium leading-[1.5]",
                                            isActive
                                                ? "font-semibold text-typo-primary tb:font-medium"
                                                : isCompleted
                                                  ? "text-success"
                                                  : "text-typo-soft"
                                        )}
                                    >
                                        {step.title}
                                    </span>
                                </div>

                                <div
                                    className={cn(
                                        "h-px w-full",
                                        isCompleted || isActive
                                            ? "bg-bg-dark-main"
                                            : "bg-bd-main"
                                    )}
                                />
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
            </Carousel>

            <div className="w-full flex-1">{children}</div>

            <CaskInfoDrawer
                open={isCaskInfoOpen}
                onOpenChange={setIsCaskInfoOpen}
                caskData={statusCheckout.cask}
            />
        </div>
    );
}
