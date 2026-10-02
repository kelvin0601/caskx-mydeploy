"use client";

import {
    CardSuggestion,
    CardSuggestionSkeleton,
} from "@/components/shared/cask-card-quantity-controls";
import CaskSummary from "@/components/shared/cask-summary";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { InputWithoutForm } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useThrottle } from "@/hooks/useThrottle";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { MARKET_ORDER_KEYS } from "../../query-keys";
import type { TTableRow } from "@/types";
import {
    MarketOrderEditorAdapter,
    OrderCaskSummary,
    OrderDraft,
    PriceValidationResult,
} from "../../types";
import ExpirationSelect from "../expiration-select";
import QuantitySelector from "../quantity-selector";

type OrderEditorProps = {
    adapter: MarketOrderEditorAdapter;
    cask: OrderCaskSummary;
    order?: TTableRow;
    value: OrderDraft;
    onChange: (draft: OrderDraft) => void;
    minQuantity?: number;
    maxQuantity?: number;
    enabled?: boolean;
    className?: string;
    onValidationChange?: (result: PriceValidationResult) => void;
};

const EMPTY_VALIDATION: PriceValidationResult = {
    message: "",
    warningType: "none",
};

export default function OrderEditor({
    adapter,
    cask,
    order,
    value,
    onChange,
    minQuantity,
    maxQuantity,
    enabled = true,
    className,
    onValidationChange,
}: OrderEditorProps) {
    const { definition } = adapter;
    const { labels } = definition;
    const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
        null
    );
    const [validation, setValidation] =
        useState<PriceValidationResult>(EMPTY_VALIDATION);

    const suggestionsQuery = useQuery({
        queryKey: MARKET_ORDER_KEYS.suggestions(definition.kind, cask.id),
        queryFn: () => adapter.getSuggestions(cask.id),
        enabled: enabled && Boolean(cask.id),
    });

    const marketDataQuery = useQuery({
        queryKey: MARKET_ORDER_KEYS.marketData(cask.id),
        queryFn: () => adapter.getMarketData(cask.id),
        enabled: enabled && Boolean(cask.id),
    });

    const validationMutation = useMutation({
        mutationKey: MARKET_ORDER_KEYS.validation(definition.kind, cask.id),
        mutationFn: (price: number) => adapter.validatePrice(cask.id, price),
    });

    const publishValidation = useCallback(
        (result: PriceValidationResult) => {
            setValidation(result);
            onValidationChange?.(result);
        },
        [onValidationChange]
    );

    const validatePrice = useCallback(
        async (price: number) => {
            if (price <= 0) {
                publishValidation({
                    message: labels.zeroPriceMessage,
                    warningType: "error",
                });
                return;
            }

            try {
                publishValidation(await validationMutation.mutateAsync(price));
            } catch {
                publishValidation({
                    message: "Unable to validate this price right now.",
                    warningType: "warning",
                });
            }
        },
        [labels.zeroPriceMessage, publishValidation, validationMutation]
    );

    const throttledValidatePrice = useThrottle(validatePrice, 500);

    const updateDraft = useCallback(
        (next: Partial<OrderDraft>) => onChange({ ...value, ...next }),
        [onChange, value]
    );

    const handlePriceChange = (rawValue: string) => {
        const price = Number(rawValue.replace(/[^0-9.]/g, ""));
        setSelectedSuggestion(null);
        updateDraft({ price });
        throttledValidatePrice(price);
    };

    const handleSuggestionSelect = (suggestion: {
        id: string;
        price: number;
    }) => {
        setSelectedSuggestion(suggestion.id);
        updateDraft({ price: suggestion.price });
        throttledValidatePrice(suggestion.price);
    };

    const fallbackPrice = Array.isArray(cask.priceReference)
        ? Number(cask.priceReference[0] ?? 0)
        : Number(cask.referencePrice ?? cask.priceReference ?? 0);

    const marketPrice = definition.getMarketPrice(
        order,
        marketDataQuery.data,
        Number.isFinite(fallbackPrice) && fallbackPrice > 0 ? fallbackPrice : 0
    );

    const isWarningPrice =
        validation.message &&
        validation.warningType.toLocaleLowerCase() !== "none";
    return (
        <div className={cn("flex min-w-0 flex-col", className)}>
            <div className="grid grid-cols-10 items-center gap-5 py-3 tb:grid-cols-12 tb:gap-x-3 mb:grid-cols-4 mb:gap-y-0 mb:py-4">
                <CaskSummary
                    imageUrl={cask.imageUrl}
                    name={cask?.name}
                    vintageYear={cask.vintageYear}
                    className="col-span-6 min-w-0 tb:col-span-7 mb:col-span-full"
                />

                <div className="col-span-2 ml-auto flex w-max min-w-0 flex-col gap-1.5 tb:col-span-2 tb:ml-0 tb:w-full mb:col-span-full mb:mt-4 mb:flex-row mb:items-center mb:justify-between">
                    <span className="text-xs text-typo-soft mb:text-sm">
                        {labels.marketPriceLabel}
                    </span>
                    {marketDataQuery.isLoading ? (
                        <Skeleton className="h-5 w-24" />
                    ) : marketPrice > 0 ? (
                        <span className="text-sm font-semibold text-typo-primary">
                            {formatCurrency(marketPrice)}
                            <span className="font-normal text-typo-soft">
                                /cask
                            </span>
                        </span>
                    ) : (
                        <span className="text-sm font-semibold text-typo-primary">
                            -
                        </span>
                    )}
                </div>

                <div className="col-span-2 flex justify-end tb:col-span-3 mb:col-span-full mb:mt-2">
                    <QuantitySelector
                        quantity={value.quantity}
                        setQuantity={(quantity) => updateDraft({ quantity })}
                        minQuantity={minQuantity}
                        maxQuantity={maxQuantity}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-bd-main py-5 mb:py-4">
                <span className="text-sm text-typo-soft">
                    {labels.suggestionSectionLabel}
                </span>

                <Carousel opts={{ align: "start", dragFree: true }}>
                    <CarouselContent className="gap-2 tb:grid tb:grid-cols-12 mb:flex">
                        {suggestionsQuery.isLoading
                            ? Array.from({ length: 3 }).map((_, index) => (
                                  <CarouselItem
                                      key={index}
                                      className="flex-1 p-0 tb:col-span-4 mb:min-w-40 mb:flex-none mb:basis-40"
                                  >
                                      <CardSuggestionSkeleton />
                                  </CarouselItem>
                              ))
                            : suggestionsQuery.data?.map((item) => (
                                  <CarouselItem
                                      key={item.id}
                                      className="flex-1 p-0 tb:col-span-4 mb:min-w-40 mb:flex-none mb:basis-40"
                                  >
                                      <CardSuggestion
                                          item={item}
                                          isSelected={
                                              selectedSuggestion === item.id ||
                                              value.price === item.price
                                          }
                                          onClick={() =>
                                              handleSuggestionSelect(item)
                                          }
                                      />
                                  </CarouselItem>
                              ))}
                    </CarouselContent>
                </Carousel>

                {suggestionsQuery.isError ? (
                    <span className="text-sm text-error">
                        Unable to load suggested prices.
                    </span>
                ) : null}

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor={`${definition.kind}-order-price`}
                        className="text-sm text-typo-primary"
                    >
                        {labels.customPriceLabel}
                    </label>
                    <InputWithoutForm
                        id={`${definition.kind}-order-price`}
                        aria-invalid={validation.warningType === "error"}
                        aria-label={`${definition.kind} price`}
                        inputMode="decimal"
                        placeholder={labels.pricePlaceholder}
                        prefix="£"
                        value={formatNumber(value.price)}
                        onChange={(event) =>
                            handlePriceChange(event.target.value)
                        }
                        className={cn(
                            isWarningPrice
                                ? validation.warningType === "error"
                                    ? "!border-error"
                                    : "!border-warn"
                                : undefined
                        )}
                    />
                    {isWarningPrice ? (
                        <span
                            className={cn(
                                "text-sm",
                                validation.warningType === "error"
                                    ? "text-error"
                                    : "text-warn"
                            )}
                        >
                            {validation.message}
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="flex min-h-[4.625rem] items-center justify-between border-t border-bd-main py-4">
                <span className="text-sm text-typo-soft">
                    {labels.expirationLabel}
                </span>
                <ExpirationSelect
                    ariaLabel={labels.expirationLabel}
                    offerExpiration={value.expirationDays}
                    setOfferExpiration={(expirationDays) =>
                        updateDraft({ expirationDays })
                    }
                />
            </div>
        </div>
    );
}
