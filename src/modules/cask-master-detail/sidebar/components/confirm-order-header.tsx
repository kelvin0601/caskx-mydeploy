import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { cask } from "@/types";
import CaskSummary from "@/components/shared/cask-summary";

type ConfirmOrderHeaderProps = {
    caskDetail: cask.TCask | undefined;
    casksRequested?: number;
    availableToAcquire?: number;
    pricePerCask: number;
    expirationDays?: string | number;
    isLoading?: boolean;
    type?: "sell_now" | "place_ask" | "bid";
    requestedLabel?: string;
    availableLabel?: string;
};

export default function ConfirmOrderHeader({
    caskDetail,
    casksRequested = 0,
    availableToAcquire = 0,
    pricePerCask,
    expirationDays = "30 days",
    isLoading = false,
    type = "sell_now",
    requestedLabel = "Casks requested",
    availableLabel = "Available to acquire",
}: ConfirmOrderHeaderProps) {
    if (type === "place_ask") {
        return (
            <div className="grid grid-cols-10 border-b border-bd-main py-3 tb:grid-cols-12 mb:grid-cols-4 mb:gap-y-2 mb:py-4">
                <CaskSummary
                    imageUrl={caskDetail?.imageUrl}
                    name={caskDetail?.master?.name}
                    vintageYear={caskDetail?.vintageYear}
                    className="col-span-5 tb:col-span-6 mb:col-span-full mb:mb-2"
                />

                {/* Stats for Place Ask */}
                <div className="col-span-5 grid grid-cols-3 gap-x-4 tb:col-span-6 tb:gap-x-4 mb:col-span-full mb:flex mb:flex-col mb:gap-y-1.5">
                    <div className="col-span-1 flex flex-1 flex-col justify-center gap-1.5 text-right mb:flex-row mb:items-center mb:justify-between mb:text-left">
                        <span className="text-xs leading-none text-typo-soft mb:text-sm">
                            Listing price
                        </span>
                        <span className="text-sm font-semibold leading-normal text-typo-primary">
                            {formatCurrency(pricePerCask)}
                        </span>
                    </div>

                    <div className="col-span-1 flex flex-1 flex-col justify-center gap-1.5 text-right mb:flex-row mb:items-center mb:justify-between mb:text-left">
                        <span className="text-xs leading-none text-typo-soft mb:text-sm">
                            Quantity
                        </span>
                        {isLoading ? (
                            <Skeleton className="h-5 w-8" />
                        ) : (
                            <span className="text-sm font-semibold leading-normal text-typo-primary">
                                {casksRequested}
                            </span>
                        )}
                    </div>

                    <div className="col-span-1 flex flex-1 flex-col justify-center gap-1.5 text-right mb:flex-row mb:items-center mb:justify-between mb:text-left">
                        <span className="text-xs leading-none text-typo-soft mb:text-sm">
                            Listing expiration
                        </span>
                        <span className="text-sm font-semibold leading-normal text-typo-primary">
                            {typeof expirationDays === "number"
                                ? `${expirationDays} days`
                                : expirationDays.includes("day")
                                  ? expirationDays
                                  : `${expirationDays} days`}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-10 border-b border-bd-main py-3 tb:grid-cols-12 mb:grid-cols-4 mb:py-4">
            <CaskSummary
                imageUrl={caskDetail?.imageUrl}
                name={caskDetail?.master?.name}
                vintageYear={caskDetail?.vintageYear}
                className="col-span-5 tb:col-span-6 mb:col-span-full mb:mb-4"
            />

            {/* Stats */}
            <div className="col-span-5 grid grid-cols-3 gap-x-4 tb:col-span-6 mb:col-span-full mb:gap-y-1.5">
                <div className="col-span-1 flex flex-1 flex-col justify-center gap-1.5 text-right mb:col-span-full mb:flex-row mb:items-center mb:justify-between">
                    <span className="text-xs leading-none text-typo-soft mb:text-sm">
                        {requestedLabel}
                    </span>
                    {isLoading ? (
                        <Skeleton className="h-5 w-8" />
                    ) : (
                        <span className="text-sm font-semibold leading-normal text-typo-primary">
                            {casksRequested}
                        </span>
                    )}
                </div>

                <div className="col-span-1 flex flex-1 flex-col justify-center gap-1.5 text-right mb:col-span-full mb:flex-row mb:items-center mb:justify-between">
                    <span className="text-xs leading-none text-typo-soft mb:text-sm">
                        {availableLabel}
                    </span>
                    {isLoading ? (
                        <Skeleton className="h-5 w-8" />
                    ) : (
                        <span className="text-sm font-semibold leading-normal text-typo-primary">
                            {availableToAcquire}
                        </span>
                    )}
                </div>
                <div className="col-span-1 flex flex-1 flex-col justify-center gap-1.5 text-right mb:col-span-full mb:flex-row mb:items-center mb:justify-between">
                    <span className="text-xs leading-none text-typo-soft mb:text-sm">
                        Price per cask
                    </span>
                    <span className="text-sm font-semibold leading-normal text-typo-primary">
                        {formatCurrency(pricePerCask)}
                    </span>
                </div>
            </div>
        </div>
    );
}
