import { Button } from "@/components/ui/button";
import { InputWithoutForm } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/ui/sidebar";
import { SIDEBAR_TABS } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { useCaskDetail } from "@/modules/cask-master-detail/provider";
import { useBoundStore } from "@/store";
import { useCheckout } from "@/store/checkout";
import type { cask, caskMaster } from "@/types";
import { useEffect, useMemo, useState } from "react";
import IconChevonLeft from "../icons/icon-chevon-left";
import IconChevonRight from "../icons/icon-chevon-right";
import IconMinus from "../icons/icon-minus";
import IconPlus from "../icons/icon-plus";
import { useSearchParams } from "next/navigation";

type TOrderCard = {
    className: string;
    label: string;
    children: React.ReactNode;
    subLabel?: () => React.ReactNode;
    priceMarket?: number | string | null;
    priceLabel?: string | number | number[];
    labelMarket?: string;
    // buttonLabel?: string;
    // buttonSubLabel?: string;
    disabledQuantity?: boolean;
    caskMasterDetails?: caskMaster.TCaskMaster;
    caskActive?: cask.TCask;
};

export const OrderCardWVariant = (props: TOrderCard) => {
    const searchParams = useSearchParams();
    const caskActiveId = searchParams.get("active");
    const {
        className,
        label = "Buy now for",
        priceMarket,
        priceLabel,
        disabledQuantity,
        labelMarket,
        subLabel,
        children,
        caskMasterDetails: propCaskMasterDetails,
        caskActive: propCaskActive,
        // buttonLabel,
        // buttonSubLabel,
    } = props;
    const {
        caskMasterDetails: storeCaskMasterDetails,
        updateCaskActive,
        caskActive: storeCaskActive,
    } = useBoundStore();
    const caskMasterDetails = propCaskMasterDetails || storeCaskMasterDetails;
    const caskActive = propCaskActive || storeCaskActive;
    const { setOpen } = useSidebar();
    const { setSidebarCurrent } = useCaskDetail();
    const { quantity, setQuantity } = useCheckout();
    const MIN_QUANTITY = 1;

    const PAGE_SIZE = 8;
    const [page, setPage] = useState(1);

    const variants = (caskMasterDetails?.children?.filter(
        (item: { isListed: boolean }) => item.isListed
    ) ?? []) as caskMaster.TCaskChild[];
    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(variants.length / PAGE_SIZE));
    }, [variants.length]);

    const pagedVariants = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return variants.slice(start, start + PAGE_SIZE);
    }, [variants, page]);

    const canPrev = page > 1;
    const canNext = page < totalPages;

    useEffect(() => {
        const pageIndex = variants.findIndex(
            (variant) => variant.id === caskActiveId
        );
        if (pageIndex !== -1) {
            setPage(Math.floor(pageIndex / PAGE_SIZE) + 1);
            return;
        }
        // If data changes and current page is out of range, clamp it.
        setPage((p) => Math.min(Math.max(1, p), totalPages));
    }, [totalPages, caskActiveId]);

    return (
        <div className={cn("h-full overflow-hidden", className)}>
            <ScrollArea className="h-full w-full">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row items-start justify-between">
                        {label && (
                            <div className="flex flex-col">
                                <div className="text-base font-medium text-typo-soft mb:text-sm">
                                    {label}
                                </div>
                                <div className="text-3xl font-medium text-typo-primary tb:text-xl mb:text-2xl">
                                    {Array.isArray(priceLabel)
                                        ? priceLabel
                                              .map((item) =>
                                                  formatCurrency(item)
                                              )
                                              .join(" - ")
                                        : formatCurrency(priceLabel || 0)}
                                </div>
                            </div>
                        )}
                        {subLabel && (
                            <div className="text-sm font-medium text-typo-soft [&_b]:font-semibold [&_b]:text-typo-primary">
                                {subLabel()}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row items-center justify-between">
                            <div className="text-base font-medium text-typo-soft mb:text-sm">
                                Distillation Year
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2 rounded-full bg-bg-sf2 px-2 py-1">
                                    <button
                                        className={cn(
                                            "size-4",
                                            !canPrev &&
                                                "pointer-events-none opacity-40"
                                        )}
                                        type="button"
                                        onClick={() => {
                                            if (canPrev)
                                                setPage((p) =>
                                                    Math.max(1, p - 1)
                                                );
                                        }}
                                        aria-label="Previous page"
                                    >
                                        <IconChevonLeft />
                                    </button>
                                    <div className="inline-flex flex-row items-center gap-1 text-sm font-medium">
                                        <span>{page}</span>
                                        <span>/</span>
                                        <span>{totalPages}</span>
                                    </div>
                                    <button
                                        className={cn(
                                            "size-4",
                                            !canNext &&
                                                "pointer-events-none opacity-40"
                                        )}
                                        type="button"
                                        onClick={() => {
                                            if (canNext)
                                                setPage((p) =>
                                                    Math.min(totalPages, p + 1)
                                                );
                                        }}
                                        aria-label="Next page"
                                    >
                                        <IconChevonRight />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-4 !gap-2">
                            {pagedVariants.map((items) => {
                                return (
                                    <Button
                                        variant={"outline"}
                                        key={items.id}
                                        onClick={() => {
                                            updateCaskActive(items);
                                        }}
                                        className={cn(
                                            caskActive?.id === items.id &&
                                                "border-brand",
                                            "min-w-max"
                                        )}
                                    >
                                        <span className="text-base font-medium">
                                            {items.vintageYear}
                                        </span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-base font-medium text-typo-soft mb:text-sm">
                            Quantity
                        </div>
                        <div className="flex flex-col gap-4 mb:gap-2">
                            <div className="relative">
                                <div
                                    className={cn(
                                        "absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full p-2.5 text-typo-soft transition-all duration-300 hover:bg-bg-sf1",
                                        quantity <= MIN_QUANTITY &&
                                            "pointer-events-none text-typo-disable",
                                        disabledQuantity &&
                                            "pointer-events-none text-typo-disable"
                                    )}
                                    onClick={() => {
                                        if (
                                            quantity > MIN_QUANTITY &&
                                            !disabledQuantity
                                        ) {
                                            setQuantity(quantity - 1);
                                        }
                                    }}
                                >
                                    <div className="h-4 w-4">
                                        <IconMinus />
                                    </div>
                                </div>
                                <InputWithoutForm
                                    type="number"
                                    disabled={disabledQuantity}
                                    value={
                                        quantity === 0
                                            ? "0"
                                            : quantity < 10
                                              ? `0${quantity}`
                                              : `${quantity}`
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value) {
                                            setQuantity(parseInt(value));
                                        }
                                    }}
                                    className="h-12 bg-bg-main text-center text-base font-medium text-typo-soft mb:h-10"
                                />
                                <div
                                    className={cn(
                                        "absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full p-2.5 transition-all duration-300 hover:bg-bg-sf1",
                                        disabledQuantity &&
                                            "pointer-events-none text-typo-disable"
                                    )}
                                    onClick={() => {
                                        if (!disabledQuantity) {
                                            setQuantity(quantity + 1);
                                        }
                                    }}
                                >
                                    <div className="h-4 w-4">
                                        <IconPlus />
                                    </div>
                                </div>
                            </div>
                            {children}
                            {!disabledQuantity && (
                                <div className="item-center mt-2 flex flex-row justify-between">
                                    <div className="flex flex-row items-center gap-2">
                                        <div className="text-base text-typo-soft mb:text-sm">
                                            {labelMarket}
                                        </div>
                                        <div className="text-base font-medium text-typo-primary">
                                            {priceMarket
                                                ? formatCurrency(priceMarket)
                                                : "N/A"}
                                        </div>
                                    </div>
                                    <Button
                                        className="hover-line-active text-typo-primary"
                                        variant={"link"}
                                        onClick={() => {
                                            setSidebarCurrent(
                                                SIDEBAR_TABS.MARKET,
                                                true
                                            );
                                            setOpen(true);
                                        }}
                                    >
                                        View Market Data
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};
