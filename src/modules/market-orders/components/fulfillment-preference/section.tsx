import { RadioGroup } from "@/components/ui/radio-group";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { pluralize } from "@/lib/utils";
import { MarketOrderKind } from "../../types";
import { MARKET_ORDER_KIND } from "../../constants";
import FulfillmentPreferenceItem from "./item";

type FulfillmentPreferenceSectionProps = {
    kind: MarketOrderKind;
    executionPolicy: EBidExecutionPolicy;
    onExecutionPolicyChange: (value: EBidExecutionPolicy) => void;
    expirationDays: string;
    quantity: number;
    fulfilledQuantity?: number;
    footnote?: React.ReactNode;
};

const DEFAULT_FOOTNOTE = "A 5% processing fee is included upon match.";

export default function FulfillmentPreferenceSection({
    kind,
    executionPolicy,
    onExecutionPolicyChange,
    expirationDays,
    quantity,
    fulfilledQuantity = 0,
    footnote = DEFAULT_FOOTNOTE,
}: FulfillmentPreferenceSectionProps) {
    const hasPartialNow = fulfilledQuantity > 0;
    const parsedExpiration = parseInt(expirationDays, 10);
    const formattedExpiration = `${parsedExpiration} ${pluralize(parsedExpiration, "day")}`;
    const isListing = kind === MARKET_ORDER_KIND.LISTING;

    const partialTitle = hasPartialNow
        ? isListing
            ? "Sell available casks now"
            : "Get what's available now"
        : "Fill over time";

    const partialDescription = hasPartialNow ? (
        <>
            {isListing ? "Sell" : "Take"}{" "}
            <strong className="font-semibold text-typo-primary">
                {fulfilledQuantity}
            </strong>{" "}
            {pluralize(fulfilledQuantity, "cask")} immediately. Remaining casks
            will stay active for{" "}
            <strong className="font-semibold text-typo-primary">
                {formattedExpiration}
            </strong>{" "}
            and{" "}
            {isListing
                ? "sell as matching buyers"
                : "be filled when matching listings"}{" "}
            become available.
        </>
    ) : (
        <>
            Your {isListing ? "listing" : "offer"} will stay active for{" "}
            <strong className="font-semibold text-typo-primary">
                {formattedExpiration}
            </strong>{" "}
            and fills as matching {isListing ? "buyers" : "listings"} become
            available.
        </>
    );

    const fullDescription =
        hasPartialNow && !isListing ? (
            <>
                No casks will be purchased now. Your offer will stay active for{" "}
                <strong className="font-semibold text-typo-primary">
                    {formattedExpiration}
                </strong>{" "}
                and only complete if all{" "}
                <strong className="font-semibold text-typo-primary">
                    {quantity}
                </strong>{" "}
                casks are available.
            </>
        ) : (
            <>
                Your {isListing ? "listing" : "offer"} will stay active for{" "}
                <strong className="font-semibold text-typo-primary">
                    {formattedExpiration}
                </strong>{" "}
                and only complete if all{" "}
                <strong className="font-semibold text-typo-primary">
                    {quantity}
                </strong>{" "}
                {pluralize(quantity, "cask")}{" "}
                {isListing ? "can be sold" : "are available"}.
            </>
        );

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-typo-primary">
                Fulfillment preference
            </span>
            <RadioGroup
                value={executionPolicy}
                onValueChange={(value) =>
                    onExecutionPolicyChange(value as EBidExecutionPolicy)
                }
                className="grid grid-cols-2 !gap-2 tb:grid-cols-12 mb:grid-cols-4 tb:[&>label]:col-span-6 tb:[&>label]:rounded-none mb:[&>label]:col-span-full"
            >
                <FulfillmentPreferenceItem
                    value={EBidExecutionPolicy.PARTIAL_ALLOWED}
                    title={partialTitle}
                    label="Recommended"
                    variant="success"
                    description={partialDescription}
                />
                <FulfillmentPreferenceItem
                    value={EBidExecutionPolicy.FULL_AT_ONCE}
                    title="Wait for full quantity"
                    label="Possible delay"
                    variant="warning"
                    description={fullDescription}
                />
            </RadioGroup>
            {footnote ? (
                <span className="text-xs text-typo-soft">{footnote}</span>
            ) : null}
        </div>
    );
}
