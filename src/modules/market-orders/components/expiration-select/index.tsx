import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EXPIRATION_OPTIONS } from "@/lib/constants";

type OfferExpirationSelectProps = {
    offerExpiration: string;
    setOfferExpiration: (v: string) => void;
    ariaLabel?: string;
};

export default function OfferExpirationSelect({
    offerExpiration,
    setOfferExpiration,
    ariaLabel = "Order expiration",
}: OfferExpirationSelectProps) {
    const currentValue = String(offerExpiration ?? "");
    const hasPresetOption = EXPIRATION_OPTIONS.some(
        (option) => option.value === currentValue
    );
    const options =
        currentValue && !hasPresetOption
            ? [
                  {
                      label: `${currentValue} ${currentValue === "1" ? "day" : "days"}`,
                      value: currentValue,
                  },
                  ...EXPIRATION_OPTIONS,
              ]
            : EXPIRATION_OPTIONS;

    return (
        <Select value={currentValue} onValueChange={setOfferExpiration}>
            <SelectTrigger
                aria-label={ariaLabel}
                className="dark:bg-white/[0.04] h-[1.875rem] w-max gap-1.5 rounded-none border-none bg-black/[0.04] py-0 pl-4 pr-2 text-sm font-medium text-typo-primary shadow-none focus:ring-0 focus:ring-offset-0 mb:h-[1.875rem] [&>span]:line-clamp-1"
            >
                <SelectValue />
            </SelectTrigger>

            <SelectContent
                align="end"
                className="rounded-none border border-bd-main bg-bg-main shadow-[0px_4px_16px_rgba(0,0,0,0.08)]"
            >
                {options.map((opt) => (
                    <SelectItem
                        key={opt.value.toString()}
                        value={opt.value.toString()}
                    >
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
