import { Button } from "@/components/ui/button";
import { SIDEBAR_TABS, TSidebarTabs } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { cask } from "@/types";
import ImagePlaceholder from "../image-placeholder";

export type TCaskHeaderProps = {
    data?: cask.TCask | null;
    price: number;
    priceLabel: string;
    onViewMarketData?: () => void;
    setSidebarCurrent?: (sidebarCurrent: TSidebarTabs) => void;
    className?: string;
};

export default function CaskHeader({
    data,
    price,
    priceLabel,
    onViewMarketData,
    className = "",
    setSidebarCurrent,
}: TCaskHeaderProps) {
    const { name } = data || {};

    const handleViewMarketData = () => {
        if (onViewMarketData) {
            onViewMarketData();
        } else {
            setSidebarCurrent?.(SIDEBAR_TABS.MARKET);
        }
    };

    return (
        <div className={`flex flex-row gap-4 ${className}`}>
            <div className="aspect-[130/100] h-[6.25rem] overflow-hidden rounded-[0.3125rem]">
                <ImagePlaceholder
                    src={data?.imageUrl}
                    width={260}
                    height={200}
                    alt={name}
                />
            </div>
            <div className="flex flex-1 flex-col justify-between">
                <div className="flex flex-col gap-2 tb:gap-1">
                    <h3 className="text-base font-semibold">{name}</h3>
                    <div className="flex flex-row items-center gap-1">
                        <span className="text-sm text-typo-soft">
                            {priceLabel}:
                        </span>
                        <span className="font-medium text-typo-primary">
                            {formatCurrency(price || 0)}
                        </span>
                    </div>
                </div>
                <div>
                    <Button
                        variant={"link"}
                        className="p-0"
                        onClick={handleViewMarketData}
                    >
                        View Market Data
                    </Button>
                </div>
            </div>
        </div>
    );
}
