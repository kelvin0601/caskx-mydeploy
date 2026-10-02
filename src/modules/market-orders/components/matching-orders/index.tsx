import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, formatTimeRemaining, pluralize } from "@/lib/utils";
import { caskAsk } from "@/types/cask-ask";
import { caskBid } from "@/types/cask-bid";

type MatchingItem = {
    id?: string;
    quantityNeeded?: number;
    totalCost?: number;
    askPrice?: number;
    bidPrice?: number;
    expirationDate?: string;
    ask?: {
        id?: string;
        askPrice?: number;
        expirationDate?: string;
    };
    bid?: {
        id?: string;
        bidPrice?: number;
        expirationDate?: string;
    };
};

type MatchingOrdersProps = {
    matchingData?:
        | caskBid.TMatchingBidsResponse
        | caskAsk.TMatchingBidsResponse
        | null;
    statusText?: React.ReactNode;
    showHeader?: boolean;
    priceLabel?: string;
    subtotalLabel?: string;
    expirationLabel?: string;
};

export default function MatchingOrders({
    matchingData,
    statusText,
    showHeader = true,
    priceLabel = "Price",
    subtotalLabel = "Subtotal",
    expirationLabel = "Expiry In",
}: MatchingOrdersProps) {
    const fulfilledQuantity =
        matchingData?.fulfillmentSummary?.fulfilledQuantity ?? 0;
    const details = matchingData?.fulfillmentDetails;
    const detailCount = details?.length ?? 0;

    return (
        <div className="flex flex-col gap-2">
            {showHeader ? (
                <>
                    <h4 className="text-sm font-semibold text-typo-primary">
                        Matching status
                    </h4>
                    <div className="text-sm text-typo-soft">
                        {statusText ?? (
                            <>
                                <span className="font-medium text-typo-primary">
                                    {fulfilledQuantity}{" "}
                                    {pluralize(fulfilledQuantity, "cask")}{" "}
                                </span>
                                match your offer price across {detailCount}{" "}
                                {pluralize(detailCount, "listing")}.
                            </>
                        )}
                    </div>
                </>
            ) : null}
            <div className="relative pr-4">
                <ScrollArea className="-mr-4 max-h-[13.9rem] border-b border-bd-main pr-1">
                    <div className="w-full">
                        <div className="sticky top-0 z-10 flex items-center border-y border-bd-main bg-bg-main text-xs leading-none text-typo-note">
                            <div className="w-[25%] py-3 pr-2">Quantity</div>
                            <div className="w-[25%] px-2 py-3">
                                {priceLabel}
                            </div>
                            <div className="w-[25%] px-2 py-3">
                                {subtotalLabel}
                            </div>
                            <div className="w-[25%] py-3 pl-2 text-right">
                                {expirationLabel}
                            </div>
                        </div>

                        {details ? (
                            <div className="flex flex-col divide-y divide-bd-main">
                                {details.map((item: MatchingItem, index) => {
                                    const quantity = item.quantityNeeded ?? 0;
                                    const price =
                                        item.ask?.askPrice ??
                                        item.bid?.bidPrice ??
                                        item.askPrice ??
                                        item.bidPrice ??
                                        0;
                                    const totalCost =
                                        item.totalCost ?? quantity * price;
                                    const expirationDate =
                                        item.ask?.expirationDate ??
                                        item.bid?.expirationDate ??
                                        item.expirationDate;

                                    return (
                                        <div
                                            className="flex items-center py-3 text-base font-medium text-typo-primary tb:h-[2.8125rem]"
                                            key={
                                                item.ask?.id ??
                                                item.bid?.id ??
                                                item.id ??
                                                index
                                            }
                                        >
                                            <div className="w-[25%] pr-2 text-sm">
                                                {quantity}
                                            </div>
                                            <div className="w-[25%] px-2 text-sm">
                                                {formatCurrency(price)}
                                            </div>
                                            <div className="w-[25%] px-2 text-sm">
                                                {formatCurrency(totalCost)}
                                            </div>
                                            <div className="w-[25%] pl-2 text-right text-sm">
                                                {expirationDate
                                                    ? formatTimeRemaining(
                                                          expirationDate
                                                      )
                                                    : "-"}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
