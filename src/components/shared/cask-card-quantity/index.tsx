import { Card } from "@/components/ui/card";
import { InputWithoutForm } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { useCheckout } from "@/store/checkout";
import { cask } from "@/types";
import IconMinus from "../icons/icon-minus";
import IconPlus from "../icons/icon-plus";
import ImagePlaceholder from "../image-placeholder";

export type TCaskCardQuantity = {
    data?: cask.TCask;
    subContent: string;
    isShowQuantity?: boolean;
    limit?: number;
    priceCask: number;
    countQuantity?: string;
};

export default function CaskCardQuantity(props: TCaskCardQuantity) {
    const {
        data,
        subContent,
        isShowQuantity,
        limit,
        priceCask,
        countQuantity,
    } = props;
    const { name } = data || {};
    const { setQuantity, quantity } = useCheckout();

    return (
        <Card className="bg-bg-sf1 p-4">
            <div className="flex flex-row gap-4">
                <div className="aspect-[130/100] h-[6.25rem] overflow-hidden rounded-[0.3125rem]">
                    <ImagePlaceholder
                        src={data?.imageUrl}
                        width={260}
                        height={200}
                        alt={name}
                    />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1">
                    <h3 className="text-base font-semibold">{name}</h3>
                    <div className="flex flex-row items-center gap-1">
                        <span className="text-sm text-typo-soft">
                            {subContent}
                        </span>
                        <span className="text-base font-medium text-typo-primary">
                            {formatCurrency(Number(priceCask))}
                        </span>
                    </div>
                    {isShowQuantity ? (
                        <div className="flex flex-row items-center gap-1 text-sm">
                            <span className="text-typo-soft">Quantity:</span>
                            <span className="font-medium text-typo-primary">
                                {countQuantity ? countQuantity : quantity}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-row items-end justify-between gap-4">
                            <div className="relative w-[7.875rem]">
                                <div
                                    className={cn(
                                        "absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full p-1 text-typo-soft transition-all duration-300 hover:bg-bg-main",
                                        quantity === 1 &&
                                            "pointer-events-none text-typo-disable"
                                    )}
                                    onClick={() => {
                                        if (quantity > 1) {
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
                                    className="bg-main h-10 rounded-[0.3125rem] text-center text-base font-medium text-typo-soft"
                                />
                                <div
                                    className={cn(
                                        "absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full p-1 transition-all duration-300 hover:bg-bg-main"
                                    )}
                                    onClick={() => {
                                        setQuantity(quantity + 1);
                                    }}
                                >
                                    <div className="h-4 w-4">
                                        <IconPlus />
                                    </div>
                                </div>
                            </div>
                            {/* {limit && limit > 0 && limit < 10 && (
                                <div className="text-xs font-medium text-error">
                                    Only {limit} {limit > 1 ? "lefts" : "left"}
                                </div>
                            )} */}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
