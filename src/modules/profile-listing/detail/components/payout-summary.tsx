import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn, formatCurrency } from "@/lib/utils";

type TPayoutSummaryProps = {
    estimatedValue?: number;
    matchedValue?: number;
    totalPaid?: number;
    totalUnpaid?: number;
    className?: string;
};

export function PayoutSummary({
    estimatedValue = 0,
    matchedValue = 0,
    totalPaid = 0,
    totalUnpaid = 0,
    className,
}: TPayoutSummaryProps) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-typo-soft">Est. total value</span>
                <span className="font-semibold text-typo-primary">
                    {formatCurrency(estimatedValue)}
                </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-typo-soft">Total matched value</span>
                <span className="font-semibold text-typo-primary">
                    {formatCurrency(matchedValue)}
                </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-typo-soft">Total paid</span>
                <span className="font-semibold text-typo-primary">
                    {formatCurrency(totalPaid)}
                </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-typo-soft">Total unpaid</span>
                <span className="font-semibold text-typo-primary">
                    {formatCurrency(totalUnpaid)}
                </span>
            </div>
        </div>
    );
}

export function TabletPayoutSummary({
    estimatedValue = 0,
    matchedValue = 0,
    totalPaid = 0,
    totalUnpaid = 0,
}: {
    estimatedValue?: number;
    matchedValue?: number;
    totalPaid?: number;
    totalUnpaid?: number;
}) {
    return (
        <section className="mt-4 hidden border-t border-bd-main bg-bg-main p-5 pt-4 tb:sticky tb:bottom-0 tb:z-[100] tb:block mb:-mx-4">
            <Accordion
                type="single"
                collapsible
                defaultValue="payout-summary"
                className="w-full"
            >
                <AccordionItem value="payout-summary" className="border-none">
                    <AccordionTrigger
                        className="border-b border-bd-main px-0 py-0 pb-5 text-left tb:border-0 tb:pb-0 data-[state=open]:tb:border-b-0 data-[state='false']:tb:pb-0 mb:border-0"
                        classNameChevron="size-5"
                    >
                        <span className="text-sm font-semibold text-typo-primary">
                            Payout summary
                        </span>
                    </AccordionTrigger>
                    <AccordionContent
                        containerClassName="px-0"
                        className="pb-0 pt-5 mb:mt-4 mb:border-t mb:pt-4"
                    >
                        <PayoutSummary
                            estimatedValue={estimatedValue}
                            matchedValue={matchedValue}
                            totalPaid={totalPaid}
                            totalUnpaid={totalUnpaid}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    );
}

export function ListingSidebarPayoutSummary({
    estimatedValue = 0,
    matchedValue = 0,
    totalPaid = 0,
    totalUnpaid = 0,
}: {
    estimatedValue?: number;
    matchedValue?: number;
    totalPaid?: number;
    totalUnpaid?: number;
}) {
    return (
        <div className="relative flex flex-shrink-0 flex-col overflow-hidden border-t border-bd-main bg-bg-main">
            <Accordion
                type="single"
                collapsible
                defaultValue="payout-summary"
                className="w-full"
            >
                <AccordionItem value="payout-summary" className="border-none">
                    <AccordionTrigger
                        className="px-6 py-5 text-left data-[state=open]:pb-2"
                        classNameChevron="size-5"
                    >
                        <span className="text-sm font-semibold text-typo-primary">
                            Payout summary
                        </span>
                    </AccordionTrigger>
                    <AccordionContent
                        containerClassName="px-6"
                        className="pb-6"
                    >
                        <PayoutSummary
                            estimatedValue={estimatedValue}
                            matchedValue={matchedValue}
                            totalPaid={totalPaid}
                            totalUnpaid={totalUnpaid}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
