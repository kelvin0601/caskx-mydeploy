import { MessageError } from "@/components/ui/form";
import { InputWithoutForm } from "@/components/ui/input";
import { cn, formatNumber } from "@/lib/utils";
import { useCheckout } from "@/store/checkout";
import type { TErrorMessage, TValidatePrice } from ".";
import InputWControl from "../input-w-control";
import { memo } from "react";

export type TQuantityControlsProps = {
    price: number;
    onPriceChange: (price: number) => void;
    onPriceValidate?: TValidatePrice;
    errorMessage?: TErrorMessage;
    priceLabel?: string;
    pricePlaceholder?: string;
    showQuantity?: boolean;
    showPrice?: boolean;
    className?: string;
};

function QuantityControls({
    price,
    onPriceChange,
    onPriceValidate,
    errorMessage,
    priceLabel = "Or Name Your Bid",
    pricePlaceholder = "Enter bid",
    showQuantity = true,
    showPrice = true,
    className = "",
}: TQuantityControlsProps) {
    const { quantity, setQuantity } = useCheckout();

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const priceValue = value.replace(/[^0-9.]/g, "");
        const numericPrice = Number(priceValue);

        // If user enters 0, convert it to 1
        onPriceChange(numericPrice);

        if (onPriceValidate) {
            onPriceValidate(numericPrice);
        }
    };

    console.log("errorMessage", errorMessage);

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <div className="flex flex-col gap-1.5">
                {showPrice && (
                    <>
                        <div className="text-base font-medium text-typo-primary">
                            {priceLabel}
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-typo-note">
                                £
                            </div>
                            <InputWithoutForm
                                type="text"
                                className="pl-8"
                                maxLength={12}
                                placeholder={pricePlaceholder}
                                value={formatNumber(price)}
                                onChange={handlePriceChange}
                            />
                        </div>
                    </>
                )}
                {errorMessage?.warningType?.toLowerCase() !== "NONE" && (
                    <MessageError
                        className={cn(
                            "text-warn",
                            errorMessage?.warningType === "error" &&
                                "text-error"
                        )}
                        message={errorMessage?.message || ""}
                    />
                )}
            </div>

            {showQuantity && (
                <div className="flex flex-col gap-1.5">
                    <div className="text-base font-medium text-typo-primary">
                        Quantity
                    </div>
                    <div className="relative">
                        <InputWControl
                            value={quantity}
                            setValue={(number) => {
                                setQuantity(Number(number));
                            }}
                            onBlur={() => {
                                if (quantity === 0) {
                                    setQuantity(1);
                                }
                            }}
                            className="w-full [&_input]:h-10 [&_input]:bg-bg-main [&_input]:text-base"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(QuantityControls);
