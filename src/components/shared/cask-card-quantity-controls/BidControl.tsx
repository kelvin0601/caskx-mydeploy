import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useThrottle } from "@/hooks/useThrottle";
import { TSidebarTabs } from "@/lib/constants";
import { KEY_BID } from "@/lib/constants/key";
import { caskBidService } from "@/services/cask-bid";
import { useCheckout } from "@/store/checkout";
import { cask } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { TValidatePrice, TWarningType } from ".";
import CaskHeader from "./ControlHeader";
import QuantityControls from "./QuantityControl";
import SuggestionCards, { TSuggestionItem } from "./SuggestionCards";
import useGetStateQuery from "@/hooks/useGetStateQuery";

export type TBidControlsProps = {
    data: cask.TCask | null;
    priceBid: number;
    onValidatePrice?: TValidatePrice;
    className?: string;
    setSidebarCurrent?: (sidebarCurrent: TSidebarTabs) => void;
    priceLabel?: string;
    showSuggestion?: boolean;
    showQuantity?: boolean;
};

export default function BidControls({
    data,
    priceBid,
    onValidatePrice,
    className = "",
    setSidebarCurrent,
    priceLabel = "Lowest ask",
    showSuggestion = true,
    showQuantity = true,
}: TBidControlsProps) {
    const [errorMessage, setErrorMessage] = useState<{
        message: string;
        warningType?: TWarningType;
    }>({
        message: "",
        warningType: "none",
    });
    const [bidSelected, setBidSelected] = useState<string | null>(null);
    const { quantity, setSubTotal, setPriceCaskCurrent, priceCaskCurrent } =
        useCheckout();
    const { open } = useSidebar();

    const throttleValidatePrice = useThrottle(
        (price: number) =>
            onValidatePrice?.(price, (message, warningType) => {
                setErrorMessage({ message, warningType });
            }),
        500
    );

    const dataCacheMarket = useGetStateQuery({
        key: [KEY_BID.BID_MARKET_DATA, data?.id],
        fetchFn: () => {
            if (data?.id) {
                return caskBidService.getCaskBidMarketData(data.id);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return Promise.resolve({}) as Promise<{ [key: string]: any }>;
        },
    });

    const suggestMarketData = useQuery({
        queryKey: [KEY_BID.BID_SUGGESTION, data?.id],
        enabled: !!data?.id,
        queryFn: () => {
            return caskBidService.getCaskBidSuggestion(data!.id!);
        },
        staleTime: 0,
        gcTime: 0,
    });

    const MAP_VALUE = {
        goodBid: "Good Bid",
        betterBid: "Better Bid",
        buyFaster: "Best Bid",
    };

    const DATA_SUGGESTION = useMemo(() => {
        return Object?.entries(suggestMarketData?.data || {})?.reduce(
            (acc, [key, value]) => {
                if (MAP_VALUE[key as keyof typeof MAP_VALUE]) {
                    acc.push({
                        id: key,
                        label: MAP_VALUE[key as keyof typeof MAP_VALUE],
                        price: Number(value),
                    });
                }
                return acc;
            },
            [] as TSuggestionItem[]
        );
    }, [suggestMarketData.data]);

    const priceCask = useMemo(() => {
        return priceBid || 0;
    }, [priceBid]);

    const handleSuggestionSelect = useCallback(
        (item: TSuggestionItem) => {
            suggestMarketData.refetch();
            setBidSelected(item.id);
            setSubTotal(item.price * quantity);
            setPriceCaskCurrent(item.price);
            throttleValidatePrice(item.price);
        },
        [
            suggestMarketData,
            setSubTotal,
            quantity,
            setPriceCaskCurrent,
            throttleValidatePrice,
        ]
    );

    const handlePriceChange = useCallback(
        (price: number) => {
            setPriceCaskCurrent(price);
            setBidSelected(null);
            throttleValidatePrice(price);
        },
        [setPriceCaskCurrent, setBidSelected, throttleValidatePrice]
    );

    useEffect(() => {
        if (open && !dataCacheMarket?.refetch && !suggestMarketData.isLoading) {
            dataCacheMarket?.refetch?.();
            suggestMarketData?.refetch();
        }
    }, [open]);

    return (
        <Card className={`flex flex-col gap-4 bg-bg-sf1 p-4 ${className}`}>
            <CaskHeader
                data={data}
                price={priceCask}
                priceLabel={priceLabel}
                setSidebarCurrent={setSidebarCurrent}
            />
            {showSuggestion && <Separator />}

            {showSuggestion && !!DATA_SUGGESTION.length && (
                <SuggestionCards
                    suggestions={DATA_SUGGESTION}
                    selectedId={bidSelected}
                    onSelect={handleSuggestionSelect}
                    isLoading={suggestMarketData.isLoading}
                    title="Suggested Bids (Per cask)"
                />
            )}

            <QuantityControls
                price={priceCaskCurrent}
                onPriceChange={handlePriceChange}
                onPriceValidate={onValidatePrice}
                errorMessage={errorMessage}
                priceLabel="Or Name Your Bid"
                pricePlaceholder="Enter bid"
                showPrice={showSuggestion}
            />
        </Card>
    );
}
