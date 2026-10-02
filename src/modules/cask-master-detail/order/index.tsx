import DataChip from "@/components/shared/data-chip";
import IconStar from "@/components/shared/icons/icon-start";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import ReadMore from "@/components/shared/read-more";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useStripePayouts } from "@/hooks/useStripePayouts";
import { cn } from "@/lib/utils";
import { useBoundStore } from "@/store";
import { caskMaster } from "@/types";
import { caskBid } from "@/types/cask-bid";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useCaskDetail } from "../provider";
import ActionBar from "./action-bar";

export default function Order({
    className,
    marketData,
    activeId,
    caskMasterDetails,
    caskActive,
}: {
    className: string;
    marketData?: caskBid.TCaskBidMarketData;
    activeId?: string;
    caskMasterId?: string;
    caskMasterDetails?: caskMaster.TCaskMasterWithChildren;
    caskActive?: caskMaster.TCaskChild;
}) {
    const { user } = useBoundStore();
    const { setIsOpenDialogVerify, setDialogType } = useCaskDetail();
    const queryClient = useQueryClient();

    // ── Tab state ──────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");

    const payoutsQuery = useStripePayouts(user?.stripeAccount?.id);

    // ── Market data ────────────────────────────────────────────────────────────
    const totalActiveAsks = marketData?.totalActiveAsks || 0;
    const totalActiveBids = marketData?.totalActiveBids || 0;

    const floorPrice = marketData?.lowestAsk ?? caskActive?.lowestAsk ?? null;
    const availability = marketData?.totalActiveAsks ?? 0;

    // Placeholder 30D delta — will be replaced when API supports it
    const delta30D: number | null = null;

    // ── Action handlers (all existing logic preserved) ─────────────────────────
    const handleActionMarketBuy = useCallback(
        async (action: () => void) => {
            if (!user?.isVerified) {
                setDialogType("verify");
                setIsOpenDialogVerify(true);
            } else {
                action?.();
            }
        },
        [user?.isVerified, setDialogType, setIsOpenDialogVerify]
    );

    const handleActionMarketSell = useCallback(
        async (action: () => void) => {
            if (!user?.isVerified) {
                setDialogType("verify");
                setIsOpenDialogVerify(true);
            } else if (!payoutsQuery?.data?.payouts?.externalAccounts?.length) {
                setIsOpenDialogVerify(true);
                setDialogType("addBank");
            } else {
                action?.();
            }
        },
        [
            user?.isVerified,
            payoutsQuery?.data?.payouts?.externalAccounts?.length,
            setDialogType,
            setIsOpenDialogVerify,
        ]
    );

    // ── Derived values ─────────────────────────────────────────────────────────
    const caskName = caskMasterDetails?.name ?? caskActive?.master?.name ?? "";
    const description = caskActive?.description ?? "";
    const distilleryName =
        caskMasterDetails?.distillery?.name ??
        caskActive?.master?.distillery?.name ??
        "";
    const region =
        (caskMasterDetails as { region?: { country?: string } } | undefined)
            ?.region?.country ??
        (caskActive?.master as { region?: { country?: string } } | undefined)
            ?.region?.country ??
        "";
    const caskTypeName =
        (caskMasterDetails as { caskType?: { name?: string } } | undefined)
            ?.caskType?.name ??
        (caskActive?.master as { caskType?: { name?: string } } | undefined)
            ?.caskType?.name ??
        "";
    const category = `${caskMasterDetails?.classificationLabel} ${caskMasterDetails?.peatLevels ? `(${caskMasterDetails?.peatLevels})` : ""}`;

    if (!caskActive) {
        return <OrderSkeleton className={className} />;
    }

    const renderInnerContent = () => (
        <>
            <div>
                <div className="j-tb:pb-5 j-tb:pr-5">
                    <div className="aspect-square tb:relative mb:mt-4 mb:pr-0">
                        <div className="relative flex size-full w-full items-center justify-center overflow-hidden bg-bg-dark-main tb:sticky tb:top-[var(--height-header)]">
                            {caskActive?.imageUrl && (
                                <div className="absolute inset-0 z-0">
                                    <ImagePlaceholder
                                        src={"/images/bg-cask-detail.jpg"}
                                        width={538}
                                        height={538}
                                        alt=""
                                        loading="eager"
                                        className="h-full w-full opacity-15 [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
                                    />
                                </div>
                            )}

                            {/* Centered barrel */}
                            <div className="h-[16.25rem] w-[16.25rem] overflow-hidden">
                                <ImagePlaceholder
                                    src={caskActive.imageUrl}
                                    width={520}
                                    height={520}
                                    alt="Cask barrel"
                                    loading="eager"
                                    className="z-10 h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col pb-6 pt-6 tb:aspect-square tb:overflow-auto tb:pb-5 tb:pt-0 mb:aspect-auto mb:pb-4 mb:pt-4">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <h2 className="font-reckless text-xl font-medium capitalize leading-none text-typo-primary mb:text-lg">
                        {caskName}
                    </h2>
                    <button className="h-5 w-5 text-icon">
                        <IconStar className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid grid-cols-2 !gap-2">
                    <DataChip label="Category" value={category} />
                    <DataChip label="Region" value={region} />
                    <DataChip label="Cask Type" value={caskTypeName} />
                    <DataChip label="Distillery" value={distilleryName} />
                </div>
            </div>
        </>
    );

    return (
        <div className={cn("flex flex-col pr-6 tb:pr-0", className)}>
            <div className="sticky top-[var(--height-header)] flex max-h-[calc(100vh-var(--height-header)-2.5rem-0.5rem)] flex-col transition-all tb:static tb:max-h-none">
                <ScrollArea className="-mr-3 pr-3 pt-6 transition-all tb:mr-0 tb:pr-0 tb:pt-5 mb:pt-0">
                    <div className="tb:flex tb:flex-row mb:flex-col tb:[&>div]:flex-1">
                        {renderInnerContent()}
                    </div>
                </ScrollArea>

                <ActionBar
                    caskActive={caskActive}
                    marketData={marketData}
                    className="dk:relative dk:-mx-[var(--padding-container)] tb:hidden mb:hidden"
                />
            </div>
        </div>
    );
}

export const OrderSkeleton = ({ className }: { className: string }) => {
    return (
        <div
            className={cn("flex flex-col pr-6 tb:pr-0", className)}
            aria-hidden="true"
        >
            <div className="sticky top-[var(--height-header)] flex max-h-[calc(100vh-var(--height-header)-2.5rem-0.5rem)] flex-col tb:static tb:max-h-none">
                <div className="-mr-3 pr-3 pt-6 tb:mr-0 tb:pr-0 tb:pt-5 mb:pt-0">
                    <div className="tb:flex tb:flex-row mb:flex-col tb:[&>div]:flex-1">
                        <div>
                            <div className="j-tb:pb-5 j-tb:pr-5">
                                <div className="aspect-square tb:relative mb:mt-4 mb:pr-0">
                                    <div className="relative flex size-full items-center justify-center overflow-hidden bg-bg-dark-main">
                                        <div className="relative flex h-[16.25rem] w-[16.25rem] items-center justify-center">
                                            <Skeleton className="bg-white/10 h-[13.5rem] w-[9rem] rounded-[45%]" />
                                            <Skeleton className="bg-white/10 absolute top-[4.25rem] h-2 w-[9.75rem]" />
                                            <Skeleton className="bg-white/10 absolute bottom-[4.25rem] h-2 w-[9.75rem]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col pb-6 pt-6 tb:aspect-square tb:pb-5 tb:pt-0 mb:aspect-auto mb:pb-4 mb:pt-4">
                            <div className="mb-3 flex items-start justify-between gap-4">
                                <Skeleton className="h-6 w-52 bg-bd-main/70" />
                                <Skeleton className="size-5 shrink-0 rounded-full bg-bd-main/70" />
                            </div>

                            <div className="mb-5 flex flex-col gap-2">
                                <Skeleton className="h-3 w-full bg-bd-main/70" />
                                <Skeleton className="h-3 w-11/12 bg-bd-main/70" />
                                <Skeleton className="h-3 w-3/5 bg-bd-main/70" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="flex h-14 flex-col gap-2 bg-bg-sf4 p-3"
                                    >
                                        <Skeleton className="h-2.5 w-14 bg-bd-main/70" />
                                        <Skeleton className="h-3.5 w-24 max-w-full bg-bd-main/70" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="z-30 -mx-[var(--padding-container)] border-t border-bd-main bg-bg-main p-2 tb:hidden mb:hidden">
                    <div className="bg-bg-dark-grey">
                        <div className="flex flex-col gap-5 p-6">
                            <div className="flex w-max gap-1 bg-bg-dark-sf3 p-1">
                                <Skeleton className="bg-white/10 h-[1.875rem] w-14" />
                                <Skeleton className="bg-white/10 h-[1.875rem] w-14" />
                            </div>

                            <div className="flex gap-1">
                                <div className="flex flex-1 flex-col gap-2">
                                    <Skeleton className="bg-white/10 h-2.5 w-16" />
                                    <Skeleton className="bg-white/10 h-4 w-24" />
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                    <Skeleton className="bg-white/10 h-2.5 w-20" />
                                    <Skeleton className="bg-white/10 h-4 w-10" />
                                </div>
                            </div>

                            <div className="flex gap-1">
                                <Skeleton className="bg-white/10 h-10 flex-1" />
                                <Skeleton className="bg-white/10 h-10 flex-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
