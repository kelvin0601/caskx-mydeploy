import { Button } from "@/components/ui/button";
import { InputWithoutForm } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/ui/sidebar";
import { SIDEBAR_TABS } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { useCaskDetail } from "@/modules/cask-master-detail/provider";
import { useCheckout } from "@/store/checkout";
import IconMinus from "../icons/icon-minus";
import IconPlus from "../icons/icon-plus";

type TOrderCard = {
    className: string;
    label: string;
    children: React.ReactNode;
    subLabel?: () => React.ReactNode;
    priceMarket?: number | string | null;
    priceLabel?: string;
    labelMarket?: string;
    // buttonLabel?: string;
    // buttonSubLabel?: string;
    disabledQuantity?: boolean;
};

export const OrderCard = (props: TOrderCard) => {
    const {
        className,
        label = "Buy now for",
        priceMarket,
        priceLabel,
        disabledQuantity,
        labelMarket,
        subLabel,
        children,
        // buttonLabel,
        // buttonSubLabel,
    } = props;
    const { setOpen } = useSidebar();
    const { setSidebarCurrent } = useCaskDetail();
    const { quantity, setQuantity } = useCheckout();
    const MIN_QUANTITY = 1;
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
                                    {formatCurrency(priceLabel || 0)}
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
