"use client";

import Breadcrumb from "@/components/shared/breadcrumb";
import DynamicTitle from "@/components/shared/dynamic-title";
import ListCardData, { ListCardSkeleton } from "@/components/shared/list-casks";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getListedVariants } from "@/lib/cask-variants";
import { ROUTE_PUBLIC, SIDEBAR_TABS, type TSidebarTabs } from "@/lib/constants";
import { CASK_KEYS, CASK_MASTER_KEYS, KEY_BID } from "@/lib/constants/key";
import caskServices from "@/services/cask";
import { caskBidService } from "@/services/cask-bid";
import caskMasterServices from "@/services/cask-master";
import { useBoundStore } from "@/store";
import { useCheckout } from "@/store/checkout";
import { caskMaster } from "@/types";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { redirect, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import ContentDetail, { ContentDetailSkeleton } from "./content";
import Order, { OrderSkeleton } from "./order";
import ActionBar from "./order/action-bar";
import PopupOnboarding from "./popup-onboarding";
import PopupVerify from "./popup-verify";
import PopupCheckEmail from "./popup-verify/check-email";
import { CaskDetailProvider, useCaskDetail } from "./provider";
import {
    MarketOrderFlowProvider,
    useMarketOrderFlowActions,
} from "@/modules/market-orders/flow/provider";
import WrapperDrawer from "./sidebar/WrapperDrawer";

import { SellNowFooter } from "./sidebar";
import { ConfirmSellNowFooter } from "./sidebar/ConfirmSellNow";
import {
    BuyNowSkeleton,
    ConfirmBidSkeleton,
    ConfirmBuyNowSkeleton,
    ConfirmSellNowSkeleton,
    PlaceBidSkeleton,
    PlaceAskSkeleton,
    ConfirmAskSkeleton,
    SellNowSkeleton,
} from "./sidebar/skeletons";

const DynamicFallback = ({
    id,
    skeleton,
}: {
    id: string;
    skeleton: React.ReactNode;
}) => {
    const { setLoadingState } = useCaskDetail();

    useEffect(() => {
        setLoadingState(`chunk-${id}`, true);
        return () => setLoadingState(`chunk-${id}`, false);
    }, [id, setLoadingState]);
    return <>{skeleton}</>;
};

const BuyNow = dynamic(() => import("./sidebar/BuyNow"), {
    ssr: true,
    loading: () => (
        <DynamicFallback id="buyNow" skeleton={<BuyNowSkeleton />} />
    ),
});
const PlaceBid = dynamic(() => import("./sidebar/PlaceBid"), {
    ssr: true,
    loading: () => (
        <DynamicFallback id="placeBid" skeleton={<PlaceBidSkeleton />} />
    ),
});
const ConfirmBid = dynamic(() => import("./sidebar/ConfirmBid"), {
    ssr: true,
    loading: () => (
        <DynamicFallback id="confirmBid" skeleton={<ConfirmBidSkeleton />} />
    ),
});
const ConfirmAsk = dynamic(() => import("./sidebar/ConfirmAsk"), {
    ssr: true,
    loading: () => (
        <DynamicFallback id="confirmAsk" skeleton={<ConfirmAskSkeleton />} />
    ),
});

const PlaceAsk = dynamic(() => import("./sidebar/PlaceAsk"), {
    ssr: true,
    loading: () => (
        <DynamicFallback id="placeAsk" skeleton={<PlaceAskSkeleton />} />
    ),
});
const PlaceAskFooter = dynamic(() =>
    import("./sidebar/PlaceAsk").then((module) => module.PlaceAskFooter)
);
const ConfirmAskFooter = dynamic(() =>
    import("./sidebar/ConfirmAsk").then((module) => module.ConfirmAskFooter)
);

const SellNow = dynamic(() => import("./sidebar/SellNow"), {
    ssr: true,
    loading: () => (
        <DynamicFallback id="sellNow" skeleton={<SellNowSkeleton />} />
    ),
});
const SideBarCaskListing = dynamic(
    () => import("@/components/shared/sidebar-listing"),
    {
        ssr: false,
    }
);
const ConfirmSellNow = dynamic(() => import("./sidebar/ConfirmSellNow"), {
    ssr: false,
    loading: () => (
        <DynamicFallback
            id="confirmSellNow"
            skeleton={<ConfirmSellNowSkeleton />}
        />
    ),
});
const ConfirmBuyNow = dynamic(() => import("./sidebar/ConfirmBuyNow"), {
    ssr: false,
    loading: () => (
        <DynamicFallback
            id="confirmBuyNow"
            skeleton={<ConfirmBuyNowSkeleton />}
        />
    ),
});
const BuyNowFooter = dynamic(() =>
    import("./sidebar/BuyNow").then((module) => module.BuyNowFooter)
);
const ConfirmBuyNowFooter = dynamic(
    () =>
        import("./sidebar/ConfirmBuyNow").then(
            (module) => module.ConfirmBuyNowFooter
        ),
    { ssr: false }
);
const PlaceBidFooter = dynamic(() =>
    import("./sidebar/PlaceBid").then((module) => module.PlaceBidFooter)
);
const ConfirmBidFooter = dynamic(() =>
    import("./sidebar/ConfirmBid").then((module) => module.ConfirmBidFooter)
);

function CaskDetailContent({
    id,
    activeId: serverActiveId,
}: {
    id: string;
    activeId?: string;
}) {
    const { updateCaskMasterDetails, updateCaskActive, caskActive } =
        useBoundStore();
    const { reset } = useCheckout();
    const searchParams = useSearchParams();

    const caskDetailQuery = useQuery({
        queryKey: [CASK_MASTER_KEYS.CASK_MASTER_DETAIL, id],
        queryFn: () => caskMasterServices.getDetailCaskMaster(id),
        retry: false,
    });
    const [selectedActiveId, setSelectedActiveId] = useState<
        string | undefined
    >(undefined);
    const searchActiveId = searchParams.get("active");
    const firstCaskId = caskDetailQuery.data?.children?.[0]?.id;

    useEffect(() => {
        if (searchActiveId) {
            setSelectedActiveId(searchActiveId);
        }
    }, [searchActiveId]);

    const activeId = useMemo(() => {
        return (
            selectedActiveId || searchActiveId || serverActiveId || firstCaskId
        );
    }, [selectedActiveId, searchActiveId, serverActiveId, firstCaskId]);

    const caskQuery = useQuery({
        queryKey: [CASK_KEYS.CASK_DETAIL, activeId],
        queryFn: () => caskServices.getDetailCask(activeId as string),
        enabled: !!activeId,
        retry: false,
        staleTime: 30000,
    });

    useEffect(() => {
        if (caskQuery.data) {
            updateCaskActive(caskQuery.data as caskMaster.TCaskChild);
        }
    }, [caskQuery.data, updateCaskActive]);

    if (caskDetailQuery.isError) {
        redirect(ROUTE_PUBLIC.NOT_FOUND);
    }

    const marketDataQuery = useQuery({
        queryKey: [KEY_BID.BID_MARKET_DATA, activeId],
        queryFn: () => caskBidService.getCaskBidMarketData(activeId as string),
        gcTime: Infinity,
        enabled: !!activeId && !caskDetailQuery.isError,
        refetchInterval: 30000,
    });
    const similarCasksQuery = useQuery({
        queryKey: [CASK_MASTER_KEYS.SIMILAR_CASKS, id],
        enabled: !!id,
        queryFn: () => caskMasterServices.getSimilarCaskMasters(id, 4),
    });
    console.log("similarCasksQuery.data", similarCasksQuery.data);
    useQuery({
        queryKey: [CASK_KEYS.INCREASE_VIEW_COUNT, id],
        queryFn: () => caskMasterServices.increaseViewCount(id),
        enabled: !!id && caskDetailQuery.isSuccess && !caskDetailQuery.isError,
        retry: false,
    });

    const isLoading = caskDetailQuery.isLoading;
    const displayCasks = similarCasksQuery.data;
    console.log("displayCasks", displayCasks);
    useEffect(() => {
        const detail = caskDetailQuery.data;
        if (!detail) return;

        updateCaskMasterDetails(detail);

        const variants = getListedVariants(detail.children);
        const nextActive = activeId
            ? ((detail.children ?? []).find(
                  (c) => String(c.id) === String(activeId)
              ) ?? null)
            : (variants[0] ?? null);

        reset();
        updateCaskActive(nextActive);
    }, [
        activeId,
        caskDetailQuery.data,
        reset,
        updateCaskActive,
        updateCaskMasterDetails,
    ]);

    const breadcrumbItems = useMemo(() => {
        return [
            { label: "Home", href: ROUTE_PUBLIC.HOME },
            { label: "Marketplace", href: ROUTE_PUBLIC.CASK_DETAILS },
            { label: caskDetailQuery.data?.name || "Cask Detail" },
        ];
    }, [caskDetailQuery.data?.name]);

    return (
        <div className="mb:mt-0">
            <div className="container">
                <DynamicTitle title={caskDetailQuery.data?.name} />
            </div>

            {/* Breadcrumb — full width row */}
            <div className="flex w-full items-center border-b border-bd-main">
                <div className="container py-3">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
            </div>

            {isLoading ? (
                <div className="container grid grid-cols-1 gap-0 dk:grid-cols-[33.625rem_1fr] tb:flex tb:flex-col tb:border-none">
                    <OrderSkeleton className="relative border-r border-bd-main tb:contents tb:border-b tb:border-r-0" />
                    <ContentDetailSkeleton className="tb:contents" />
                </div>
            ) : (
                <div className="container relative grid grid-cols-1 gap-0 dk:grid-cols-16 tb:flex tb:flex-col tb:border-none mb:gap-0">
                    <Order
                        className="relative top-0 col-start-1 col-end-6 border-r border-bd-main transition-all duration-300 tb:col-start-1 tb:-col-end-1 tb:-mx-[var(--padding-container)] tb:contents tb:border-b tb:border-r-0 tb:px-[var(--padding-container)]"
                        marketData={marketDataQuery.data}
                        activeId={activeId}
                        caskMasterId={id}
                        caskMasterDetails={caskDetailQuery.data}
                        caskActive={
                            caskQuery.data as caskMaster.TCaskChild | undefined
                        }
                    />
                    <ContentDetail
                        className="col-start-6 -col-end-1 dk:pl-2 tb:col-start-1 tb:-col-end-1 tb:contents tb:pl-0"
                        activeId={activeId}
                        id={id}
                        onActiveIdChange={setSelectedActiveId}
                        caskMasterDetails={caskDetailQuery.data}
                        caskActive={
                            caskQuery.data as caskMaster.TCaskChild | undefined
                        }
                        isCaskLoading={caskQuery.isFetching}
                    />
                    {caskActive && (
                        <ActionBar
                            caskActive={caskActive}
                            marketData={marketDataQuery.data}
                            className="sticky bottom-0 z-20 -mx-[var(--padding-container)] border-t border-bd-main bg-bg-main p-2 dk:hidden tb:w-auto tb:border-t-0 tb:border-none"
                        />
                    )}
                </div>
            )}

            {/* Similar Casks — full width below */}
            <div className="container">
                {similarCasksQuery?.isLoading ? (
                    <ListCardSkeleton
                        className="mt-10 border-t border-bd-main pt-10 dk:mt-16 tb:pt-6 tb:contain-paint mb:-mx-4 mb:px-4"
                        type="cask"
                    />
                ) : (
                    <ListCardData
                        title="Similar Casks"
                        lists={displayCasks}
                        type="similar_cask"
                        className="-mx-[var(--padding-container)] border-t border-bd-main px-[var(--padding-container)] pt-10 tb:pb-8 tb:pt-6 tb:contain-paint [&_*[data-dot-active='true']]:!bg-bd-inverse [&_*[data-dot='true']]:bg-bd-surface"
                        isDisableViewAll
                        pagination
                    />
                )}
            </div>
        </div>
    );
}

export const DialogPopup = () => {
    const { isOpenDialogVerify, setIsOpenDialogVerify, dialogType } =
        useCaskDetail();

    return (
        <Dialog open={isOpenDialogVerify} onOpenChange={setIsOpenDialogVerify}>
            <DialogContent className="max-w-[31.25rem] tb:max-w-[28.15rem]">
                <DialogTitle className="sr-only">
                    Trading verification
                </DialogTitle>
                {RenderDialog()?.[dialogType]?.()}
            </DialogContent>
        </Dialog>
    );
};

export const RenderDialog = () => {
    const { setIsOpenDialogVerify } = useCaskDetail();
    return {
        verify: () => (
            <PopupVerify
                description="You need to verify your email to start trading on Cask Exchange. It only takes a minute."
                action={() => setIsOpenDialogVerify(false)}
                isDisableButton={false}
                buttonText="Verify now"
            />
        ),
        send: () => <PopupCheckEmail />,
        addBank: () => (
            <PopupOnboarding
                description="Add your payout method first so we can send you the funds from your sale."
                isDisableButton={false}
                buttonText="Add payout method"
                className="w-full"
            />
        ),
    };
};

export default function CaskMasterDetailModule({
    id,
    activeId,
}: {
    id: string;
    activeId?: string;
}) {
    return (
        <SidebarProvider className="block" disableScrollLock>
            <MarketOrderFlowProvider>
                <CaskDetailProvider>
                    <CaskDetailContent id={id} activeId={activeId} />
                    <DialogPopup />
                    <RenderDrawer activeId={activeId} />
                </CaskDetailProvider>
            </MarketOrderFlowProvider>
        </SidebarProvider>
    );
}

const RenderDrawer = ({ activeId }: { activeId?: string }) => {
    const { drawerOpen, drawerCurrent } = useCaskDetail();
    const { closeFlow } = useMarketOrderFlowActions();
    const { caskActive } = useBoundStore();

    const id = (activeId || caskActive?.id) as string;

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                closeFlow();
            }
        },
        [closeFlow]
    );

    return (
        <Drawer
            repositionInputs={false}
            open={drawerOpen}
            onOpenChange={handleOpenChange}
        >
            <DrawerBody id={id} drawerCurrent={drawerCurrent} />
        </Drawer>
    );
};

const DrawerBody = ({
    id,
    drawerCurrent,
}: {
    id: string;
    drawerCurrent: TSidebarListing | null;
}) => {
    const drawerMap: Record<
        string,
        { title: string; body: React.ReactNode; footer: React.ReactNode }
    > = useMemo(
        () => ({
            [SIDEBAR_TABS.BUY_NOW]: {
                title: "Buy Now",
                body: <BuyNow id={id} />,
                footer: <BuyNowFooter id={id} />,
            },
            [SIDEBAR_TABS.CONFIRM_BUY_NOW]: {
                title: "Confirm Order",
                body: <ConfirmBuyNow id={id} />,
                footer: <ConfirmBuyNowFooter id={id} />,
            },
            [SIDEBAR_TABS.PLACE_BID]: {
                title: "Make Offer",
                body: <PlaceBid id={id} />,
                footer: <PlaceBidFooter id={id} />,
            },
            [SIDEBAR_TABS.CONFIRM_BID]: {
                title: "Confirm Offer",
                body: <ConfirmBid id={id} />,
                footer: <ConfirmBidFooter id={id} />,
            },
            [SIDEBAR_TABS.SELL_NOW]: {
                title: "Sell Now",
                body: <SellNow id={id} />,
                footer: <SellNowFooter id={id} />,
            },
            [SIDEBAR_TABS.CONFIRM_SELL_NOW]: {
                title: "Confirm Sale",
                body: <ConfirmSellNow id={id} />,
                footer: <ConfirmSellNowFooter id={id} />,
            },
            [SIDEBAR_TABS.PLACE_ASK]: {
                title: "List For Sale",
                body: <PlaceAsk id={id} />,
                footer: <PlaceAskFooter id={id} />,
            },
            [SIDEBAR_TABS.CONFIRM_ASK]: {
                title: "Review Listing",
                body: <ConfirmAsk id={id} />,
                footer: <ConfirmAskFooter id={id} />,
            },
        }),
        [id]
    );

    if (!drawerCurrent || !drawerMap[drawerCurrent]) return null;

    const { title, body, footer } = drawerMap[drawerCurrent];

    return (
        <WrapperDrawer title={title} footer={footer}>
            {body}
        </WrapperDrawer>
    );
};

export type TSidebarListing = TSidebarTabs;
