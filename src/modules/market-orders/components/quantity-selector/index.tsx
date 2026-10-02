import IconMinus from "@/components/shared/icons/icon-minus";
import IconPlus from "@/components/shared/icons/icon-plus";
import { Button } from "@/components/ui/button";
import { InputWithoutForm } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type QuantitySelectorProps = {
    quantity: number;
    setQuantity: (q: number) => void;
    minQuantity?: number;
    maxQuantity?: number;
};

export default function QuantitySelector({
    quantity,
    setQuantity,
    minQuantity = 1,
    maxQuantity,
}: QuantitySelectorProps) {
    const updateQuantity = (nextQuantity: number) => {
        const upperBound = maxQuantity ?? Number.POSITIVE_INFINITY;
        setQuantity(Math.min(upperBound, Math.max(minQuantity, nextQuantity)));
    };

    const isAtMaximum = maxQuantity !== undefined && quantity >= maxQuantity;

    return (
        <div className="-col-end-1 flex h-10 w-[8.1875rem] shrink-0 items-center justify-between border border-transparent bg-bg-sf4 px-1.5 transition-all focus-within:border-bd-main hover:border-bd-main mb:w-full">
            <Button
                variant="empty"
                aria-label="Decrease quantity"
                disabled={quantity <= minQuantity}
                onClick={() => updateQuantity(quantity - 1)}
                className={cn(
                    "size-8 min-w-0 p-0 disabled:bg-transparent",
                    quantity <= minQuantity
                        ? "text-typo-disable"
                        : "text-icon-main hover:text-typo-primary"
                )}
            >
                <div className="size-4">
                    <IconMinus />
                </div>
            </Button>
            <div>
                <InputWithoutForm
                    type="number"
                    min={minQuantity}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                            updateQuantity(parseInt(value, 10));
                        }
                    }}
                    max={maxQuantity}
                    value={quantity}
                    className="h-full w-10 border-0 bg-transparent p-0 text-center text-base font-medium text-typo-primary mb:w-auto"
                />
            </div>
            <Button
                variant="empty"
                aria-label="Increase quantity"
                disabled={isAtMaximum}
                onClick={() => updateQuantity(quantity + 1)}
                className="size-8 min-w-0 p-0 text-icon-main hover:text-typo-primary disabled:bg-transparent"
            >
                <div className="size-4">
                    <IconPlus />
                </div>
            </Button>
        </div>
    );
}
