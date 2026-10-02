import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useThrottle } from "@/hooks/useThrottle";
import { KEY_BID } from "@/lib/constants/key";
import caskAskService from "@/services/cask-ask";
import { caskBidService } from "@/services/cask-bid";
import { useCheckout } from "@/store/checkout";
import { cask } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { TErrorMessage, TValidatePrice } from ".";
import CaskHeader from "./ControlHeader";
import QuantityControls from "./QuantityControl";
import SuggestionCards, { TSuggestionItem } from "./SuggestionCards";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { TSidebarTabs } from "@/lib/constants";

export type TAskControlsProps = {
    data: cask.TCask | null;
    onValidatePrice?: TValidatePrice;
    className?: string;
    setSidebarCurrent?: (sidebarCurrent: TSidebarTabs) => void;
    priceLabel?: string;
    showSuggestion?: boolean;
    showQuantity?: boolean;
};

export default function AskControls({
    data,
    onValidatePrice,
    className = "",
    setSidebarCurrent,
    showSuggestion = true,
    showQuantity = true,
    priceLabel = "Highest bid",
}: TAskControlsProps) {
    const [errorMessage, setErrorMessage] = useState<TErrorMessage>({
        message: "",
        warningType: "warning",
    });
    const [askSelected, setAskSelected] = useState<string | null>(null);
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
            return caskAskService.getAskSuggestions(data!.id!);
        },
        staleTime: 0,
        gcTime: 0,
    });

    useEffect(() => {
        if (
            open &&
            dataCacheMarket.status !== "pending" &&
            !suggestMarketData.isLoading
        ) {
            dataCacheMarket?.refetch();
            suggestMarketData?.refetch();
        }
    }, [open]);

    const MAP_VALUE = {
        conservativeAsk: "Conservative",
        moderateAsk: "Moderate",
        aggressiveAsk: "Aggressive",
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
        return (
            dataCacheMarket?.data?.highestBid ||
            Number(data?.priceReference) ||
            0
        );
    }, [dataCacheMarket?.data]);

    const handleSuggestionSelect = useCallback(
        (item: TSuggestionItem) => {
            suggestMarketData.refetch();
            setAskSelected(item.id);
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
            setAskSelected(null);
            throttleValidatePrice(price);
        },
        [setPriceCaskCurrent, setAskSelected, throttleValidatePrice]
    );

    return (
        <Card className={`flex flex-col gap-4 bg-bg-sf1 p-4 ${className}`}>
            <CaskHeader
                data={data}
                price={priceCask}
                priceLabel={
                    priceLabel
                        ? priceLabel
                        : dataCacheMarket?.data?.highestBid
                          ? "Highest bid"
                          : "Expected Value"
                }
                setSidebarCurrent={setSidebarCurrent}
            />
            {showSuggestion && <Separator />}
            {showSuggestion && !!DATA_SUGGESTION.length && (
                <SuggestionCards
                    suggestions={DATA_SUGGESTION}
                    selectedId={askSelected}
                    onSelect={handleSuggestionSelect}
                    isLoading={suggestMarketData.isLoading}
                    title="Suggested Asks (Per cask)"
                />
            )}

            <QuantityControls
                price={priceCaskCurrent}
                onPriceChange={handlePriceChange}
                onPriceValidate={onValidatePrice}
                errorMessage={errorMessage}
                priceLabel="Or Name Your Ask"
                pricePlaceholder="Enter ask"
                showPrice={showSuggestion}
            />
        </Card>
    );
}
