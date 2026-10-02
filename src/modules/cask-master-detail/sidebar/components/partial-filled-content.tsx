import { Checkbox } from "@/components/ui/checkbox";
import { LabelWithOutForm } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import AnimateExpandHeight from "@/components/shared/animation/animate-expand-height";
import PendingOrderSection from "@/modules/market-orders/components/pending-order-section";
import { MARKET_ORDER_KIND } from "@/modules/market-orders/constants";
import OrderFilledContent from "@/modules/market-orders/components/order-filled-content";

export default function PartialFilledContent({
    subtotal,
    processingFeeAmount,
    processingFeePercent,
    discountAmount,
    totalAmount,
    remainingQuantity,
    pricePerCask,
    placeOfferOnRemaining,
    setPlaceOfferOnRemaining,
    fulfillmentPreference,
    setFulfillmentPreference,
    offerExpiration,
    setOfferExpiration,
}: {
    subtotal: number | undefined;
    processingFeeAmount: number | undefined;
    processingFeePercent: number | undefined;
    discountAmount: number | undefined;
    totalAmount: number | undefined;
    remainingQuantity: number;
    pricePerCask: number;
    placeOfferOnRemaining: boolean;
    setPlaceOfferOnRemaining: (v: boolean) => void;
    fulfillmentPreference: EBidExecutionPolicy;
    setFulfillmentPreference: (v: EBidExecutionPolicy) => void;
    offerExpiration: string;
    setOfferExpiration: (v: string) => void;
}) {
    return (
        <>
            <OrderFilledContent
                subtotal={subtotal}
                processingFeeAmount={processingFeeAmount}
                processingFeePercent={processingFeePercent}
                discountAmount={discountAmount}
                totalAmount={totalAmount}
            />

            {/* Checkbox + Pending offer section */}
            <div className="flex flex-col border-t pt-5 mb:pt-4">
                <div className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                        id="place-offer-remaining"
                        checked={placeOfferOnRemaining}
                        onCheckedChange={(v) => setPlaceOfferOnRemaining(!!v)}
                    />
                    <LabelWithOutForm
                        htmlFor="place-offer-remaining"
                        className="cursor-pointer font-normal text-typo-soft mb:text-sm"
                    >
                        Place an offer on the remaining{" "}
                        <span className="font-semibold text-typo-primary">
                            {remainingQuantity}
                        </span>{" "}
                        casks at{" "}
                        <span className="font-semibold text-typo-primary">
                            {formatCurrency(pricePerCask)}
                        </span>
                    </LabelWithOutForm>
                </div>

                <AnimateExpandHeight isOpen={placeOfferOnRemaining}>
                    <PendingOrderSection
                        kind={MARKET_ORDER_KIND.OFFER}
                        quantity={remainingQuantity}
                        executionPolicy={fulfillmentPreference}
                        onExecutionPolicyChange={setFulfillmentPreference}
                        expirationDays={offerExpiration}
                        onExpirationDaysChange={setOfferExpiration}
                        className="pt-2"
                    />
                </AnimateExpandHeight>
            </div>
        </>
    );
}
