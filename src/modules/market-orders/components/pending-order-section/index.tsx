import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { cn } from "@/lib/utils";
import { MarketOrderKind } from "../../types";
import OfferExpirationSelect from "../expiration-select";
import { FulfillmentPreferenceSection } from "../fulfillment-preference";

type PendingOrderSectionProps = {
    kind: MarketOrderKind;
    quantity: number;
    executionPolicy: EBidExecutionPolicy;
    onExecutionPolicyChange: (value: EBidExecutionPolicy) => void;
    expirationDays: string;
    onExpirationDaysChange: (value: string) => void;
    className?: string;
    footnote?: React.ReactNode;
};

type PendingOrderSummaryProps = Pick<
    PendingOrderSectionProps,
    | "kind"
    | "quantity"
    | "expirationDays"
    | "onExpirationDaysChange"
    | "className"
>;

const LABELS: Record<
    MarketOrderKind,
    { title: string; quantity: string; expiration: string }
> = {
    listing: {
        title: "Pending listing",
        quantity: "Casks listed",
        expiration: "Listing expiration",
    },
    offer: {
        title: "Pending offer",
        quantity: "Casks offered",
        expiration: "Offer expiration",
    },
};

export function PendingOrderSummary({
    kind,
    quantity,
    expirationDays,
    onExpirationDaysChange,
    className,
}: PendingOrderSummaryProps) {
    const labels = LABELS[kind];

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <span className="text-sm font-semibold text-typo-primary">
                {labels.title}
            </span>
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-typo-soft">{labels.quantity}</span>
                    <span className="font-semibold text-typo-primary">
                        {quantity}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-typo-soft">{labels.expiration}</span>
                    <OfferExpirationSelect
                        offerExpiration={expirationDays}
                        setOfferExpiration={onExpirationDaysChange}
                    />
                </div>
            </div>
        </div>
    );
}

export default function PendingOrderSection({
    kind,
    quantity,
    executionPolicy,
    onExecutionPolicyChange,
    expirationDays,
    onExpirationDaysChange,
    className,
    footnote,
}: PendingOrderSectionProps) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <PendingOrderSummary
                kind={kind}
                quantity={quantity}
                expirationDays={expirationDays}
                onExpirationDaysChange={onExpirationDaysChange}
            />
            <FulfillmentPreferenceSection
                kind={kind}
                executionPolicy={executionPolicy}
                onExecutionPolicyChange={onExecutionPolicyChange}
                expirationDays={expirationDays}
                quantity={quantity}
                footnote={footnote}
            />
        </div>
    );
}
