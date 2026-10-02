import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn, formatCurrency } from "@/lib/utils";

type TPayoutBreakdownContentProps = {
    subtotal?: number;
    processingFeeAmount?: number;
    processingFeePercent?: number;
    totalAmount?: number;
    divideAfterTotal?: boolean;
    showDiscountsNote?: boolean;
    className?: string;
};

export default function PayoutBreakdownContent({
    subtotal,
    processingFeeAmount,
    processingFeePercent = 5,
    totalAmount,
    divideAfterTotal = false,
    showDiscountsNote = false,
    className,
}: TPayoutBreakdownContentProps) {
    return (
        <div className={cn("flex flex-col gap-5 mb:gap-4", className)}>
            <Accordion
                type="single"
                collapsible
                defaultValue="payout"
                className="w-full"
            >
                <AccordionItem
                    value="payout"
                    className="border-b border-bd-main pb-5 mb:pb-4"
                >
                    <AccordionTrigger
                        classNameChevron="h-5 w-5 !text-typo-sub"
                        className="flex w-full items-center justify-between py-0 text-sm font-semibold text-typo-primary hover:no-underline"
                    >
                        Payout breakdown
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pt-2">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-typo-soft">
                                    Cask subtotal
                                </span>
                                <span className="font-semibold text-typo-primary">
                                    {formatCurrency(subtotal || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-typo-soft">
                                    Processing fee ({processingFeePercent}%)
                                </span>
                                <span className="font-semibold text-typo-primary">
                                    {formatCurrency(processingFeeAmount || 0)}
                                </span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div
                className={cn(
                    "flex flex-col gap-2",
                    divideAfterTotal && "border-b border-bd-main pb-5 mb:pb-4"
                )}
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-typo-primary">
                        Total
                    </span>
                    <span className="text-lg font-semibold text-typo-primary tb:text-base">
                        {formatCurrency(totalAmount || 0)}
                    </span>
                </div>
                {showDiscountsNote && (
                    <span className="text-xs text-typo-soft">
                        Discounts applied at checkout.
                    </span>
                )}
            </div>
        </div>
    );
}
