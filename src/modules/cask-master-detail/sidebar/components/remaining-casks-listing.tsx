import AnimateExpandHeight from "@/components/shared/animation/animate-expand-height";
import { Checkbox } from "@/components/ui/checkbox";
import { LabelWithOutForm } from "@/components/ui/label";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { formatCurrency, pluralize } from "@/lib/utils";
import PendingOrderSection from "@/modules/market-orders/components/pending-order-section";
import { MARKET_ORDER_KIND } from "@/modules/market-orders/constants";

type RemainingCasksListingProps = {
    remainingQuantity: number;
    listingPrice: number;
    isListingRemaining: boolean;
    setIsListingRemaining: (value: boolean) => void;
    fulfillmentPreference: EBidExecutionPolicy;
    setFulfillmentPreference: (value: EBidExecutionPolicy) => void;
    listingExpiration: string;
    setListingExpiration: (value: string) => void;
};

const PAYOUT_NOTE =
    "Payout is issued once the buyer's payment is complete. A 5% processing fee is included upon match.";

export default function RemainingCasksListing({
    remainingQuantity,
    listingPrice,
    isListingRemaining,
    setIsListingRemaining,
    fulfillmentPreference,
    setFulfillmentPreference,
    listingExpiration,
    setListingExpiration,
}: RemainingCasksListingProps) {
    const handleCheckedChange = (value: boolean | "indeterminate") => {
        const isChecked = Boolean(value);

        setIsListingRemaining(isChecked);
        if (isChecked) {
            setFulfillmentPreference(EBidExecutionPolicy.FULL_AT_ONCE);
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex cursor-pointer items-center gap-2">
                <Checkbox
                    id="list-remaining-casks"
                    checked={isListingRemaining}
                    onCheckedChange={handleCheckedChange}
                />
                <LabelWithOutForm
                    htmlFor="list-remaining-casks"
                    className="cursor-pointer font-normal text-typo-primary mb:text-sm"
                >
                    List the remaining{" "}
                    <span className="font-semibold">{remainingQuantity}</span>{" "}
                    {pluralize(remainingQuantity, "cask")} for sale at{" "}
                    <span className="font-semibold">
                        {formatCurrency(listingPrice)}
                    </span>
                </LabelWithOutForm>
            </div>

            <AnimateExpandHeight isOpen={isListingRemaining}>
                <PendingOrderSection
                    kind={MARKET_ORDER_KIND.LISTING}
                    quantity={remainingQuantity}
                    executionPolicy={fulfillmentPreference}
                    onExecutionPolicyChange={setFulfillmentPreference}
                    expirationDays={listingExpiration}
                    onExpirationDaysChange={setListingExpiration}
                    className="pt-2"
                    footnote={PAYOUT_NOTE}
                />
            </AnimateExpandHeight>
        </div>
    );
}
