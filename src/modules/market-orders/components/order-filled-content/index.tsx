import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export function PaymentBreakdownSkeleton() {
    return (
        <div
            className="flex flex-col gap-5 mb:gap-4"
            aria-label="Loading payment breakdown"
        >
            <div className="flex flex-col gap-2 border-b border-bd-main pb-5 mb:pb-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="size-5" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-3 w-44" />
            </div>
        </div>
    );
}

export function PaymentBreakdownError({
    message = "Payment estimate is temporarily unavailable. The final amount will be calculated when the order is updated.",
}: {
    message?: string;
}) {
    return (
        <div className="flex flex-col gap-5 mb:gap-4">
            <div className="flex flex-col gap-2 border-b border-bd-main pb-5 mb:pb-4">
                <h4 className="text-sm font-semibold text-typo-primary">
                    Payment breakdown
                </h4>
                <p className="text-sm text-typo-soft">{message}</p>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-typo-primary">
                    Total
                </span>
                <span className="text-lg font-semibold text-typo-primary">
                    -
                </span>
            </div>
        </div>
    );
}

type OrderFilledContentProps = {
    subtotal: number | undefined;
    processingFeeAmount: number | undefined;
    processingFeePercent: number | undefined;
    discountAmount?: number | undefined;
    totalAmount: number | undefined;
    remainingQuantity?: number;
    offerExpiration?: string;
    accordionTitle?: string;
    note?: string | null;
};

export default function OrderFilledContent({
    subtotal,
    processingFeeAmount,
    processingFeePercent,
    discountAmount,
    totalAmount,
    remainingQuantity,
    accordionTitle = "Payment breakdown",
    note,
}: OrderFilledContentProps) {
    return (
        <>
            <Accordion
                type="single"
                collapsible
                defaultValue="payment"
                className="w-full"
            >
                <AccordionItem
                    value="payment"
                    className="border-b border-bd-main pb-5 mb:pb-4"
                >
                    <AccordionTrigger
                        classNameChevron="size-5 !text-typo-sub"
                        className="flex w-full items-center justify-between py-0 text-sm font-semibold text-typo-primary hover:no-underline"
                    >
                        {accordionTitle}
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pt-2">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-typo-soft">
                                    Cask subtotal
                                </span>
                                <span className="font-semibold text-typo-primary">
                                    {formatCurrency(subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-typo-soft">
                                    Processing fee ({processingFeePercent || 5}
                                    %)
                                </span>
                                <span className="font-semibold text-typo-primary">
                                    {formatCurrency(processingFeeAmount)}
                                </span>
                            </div>
                            {discountAmount && discountAmount > 0 ? (
                                <div className="flex justify-between text-sm">
                                    <span className="text-typo-soft">
                                        Discounts
                                    </span>
                                    <span className="font-semibold text-success">
                                        -{formatCurrency(discountAmount)}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-typo-primary">
                        Total
                    </span>
                    <span className="text-lg font-semibold text-typo-primary tb:text-base">
                        {formatCurrency(totalAmount)}
                    </span>
                </div>
                {note !== null && (
                    <span className="text-xs text-typo-soft">
                        {note ?? "Discounts applied at checkout."}
                    </span>
                )}
            </div>

            {remainingQuantity ? (
                <div className="flex flex-col gap-2 border-t border-bd-main pt-5 mb:pt-4">
                    <div className="flex w-full flex-col gap-2">
                        <span className="text-sm font-semibold text-typo-primary">
                            Pending offer
                        </span>
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-typo-soft">
                                Casks offered
                            </div>
                            <span className="text-sm font-semibold text-typo-primary">
                                {remainingQuantity}
                            </span>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
