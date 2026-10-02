"use client";

import AuthStatus from "@/components/shared/auth/popup-status";
import DynamicTitle from "@/components/shared/dynamic-title";
import IconCoin from "@/components/shared/icons/icon-coin";
import IconCoinB from "@/components/shared/icons/icon-coin-b";
import IconHome from "@/components/shared/icons/icon-home";
import ListCardData, { ListCardSkeleton } from "@/components/shared/list-casks";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTE_PUBLIC, SIDEBAR_TABS } from "@/lib/constants";
import { CASK_KEYS, KEY_BID } from "@/lib/constants/key";
import caskServices from "@/services/cask";
import { caskBidService } from "@/services/cask-bid";
import { useBoundStore } from "@/store";
import { useCheckout } from "@/store/checkout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useCallback, useEffect } from "react";
import PopupOnboarding from "./popup-onboarding";
import PopupVerify from "./popup-verify";
import ContentDetail, { ContentDetailSkeleton } from "./content";
import MarketTab, { MarketTabFooter } from "./market-tab";
import Order, { OrderSkeleton } from "./order";
import { CaskDetailProvider, useCaskDetail } from "./provider";
import {
    BuyNowFooter,
    ConfirmAskFooter,
    ConfirmBidFooter,
    PlayBidFooter,
} from "./sidebar";
import { ConfirmBuyNowFooter } from "./sidebar/ConfirmBuyNow";
import { ConfirmSellNowFooter } from "./sidebar/ConfirmSellNow";
import { PlaceAskFooter } from "./sidebar/PlaceAsk";
import { SellNowFooter } from "./sidebar/SellNow";
import { notFound, redirect } from "next/navigation";
import { cask } from "@/types";

const BuyNow = dynamic(() => import("./sidebar/BuyNow"), {
    ssr: true,
    loading: () => <Skeleton className="h-full w-full" />,
});
const PlayBid = dynamic(() => import("./sidebar/PlaceBid"), {
    ssr: true,
    loading: () => <Skeleton className="h-full w-full" />,
});
const ConfirmBid = dynamic(() => import("./sidebar/ConfirmBid"), {
    ssr: true,
    loading: () => <Skeleton className="h-full w-full" />,
});
const ConfirmAsk = dynamic(() => import("./sidebar/ConfirmAsk"), {
    ssr: true,
    loading: () => <Skeleton className="h-full w-full" />,
});
const PlaceAsk = dynamic(() => import("./sidebar/PlaceAsk"), {
    ssr: true,
    loading: () => <Skeleton className="h-full w-full" />,
});
const SellNow = dynamic(() => import("./sidebar/SellNow"), {
    ssr: true,
    loading: () => <Skeleton className="h-full w-full" />,
});
const SideBarCaskListing = dynamic(
    () => import("@/modules/cask-listing/sidebar"),
    {
        ssr: false,
    }
);
const ConfirmSellNow = dynamic(() => import("./sidebar/ConfirmSellNow"), {
    ssr: false,
});
const ConfirmBuyNow = dynamic(() => import("./sidebar/ConfirmBuyNow"), {
    ssr: false,
});

function CaskDetailContent({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) {
    const { updateCaskMasterDetails } = useBoundStore();
    const { reset, setQuantity } = useCheckout();

    const caskDetailQuery = useQuery({
        queryKey: [CASK_KEYS.CASK_DETAIL, id],
        queryFn: () => caskServices.getDetailCask(id),
    });

    const marketDataQuery = useQuery({
        queryKey: [KEY_BID.BID_MARKET_DATA, id],
        queryFn: () => caskBidService.getCaskBidMarketData(id),
        gcTime: Infinity,
        refetchInterval: 30000,
    });

    const similarCasksQuery = useQuery({
        queryKey: [CASK_KEYS.SIMILAR_CASKS, id],
        queryFn: () => caskServices.getSimilarCask(id),
    });

    useQuery({
        queryKey: [CASK_KEYS.INCREASE_VIEW_COUNT, id],
        queryFn: () => caskServices.increaseViewCount(id),
        enabled: !!id && caskDetailQuery.isSuccess,
    });

    const isLoading = caskDetailQuery.isLoading;
    const displayCasks = similarCasksQuery.data?.similarCasks;

    useEffect(() => {
        if (caskDetailQuery.data) {
            reset();
            setQuantity(1);
        }
    }, [JSON.stringify(caskDetailQuery.data), id]);

    return (
        <div className="container mt-[4.25rem] grid grid-cols-12 tb:mt-8 tb:grid-cols-6 mb:mb-6 mb:mt-6 mb:grid-cols-4">
            <DynamicTitle title={caskDetailQuery.data?.name} />
            {children}
            {isLoading ? (
                <>
                    <ContentDetailSkeleton className="col-start-2 col-end-8 tb:col-start-1 tb:-col-end-1 tb:row-start-2" />
                    <OrderSkeleton className="relative col-start-8 col-end-12 tb:col-start-1 tb:-col-end-1 tb:row-start-1" />
                    <ListCardSkeleton
                        className="col-start-2 col-end-12 mt-16 tb:col-start-1 tb:-col-end-1 tb:mt-8 tb:contain-paint mb:-mx-4 mb:mt-6 mb:px-4"
                        type="cask"
                    />
                </>
            ) : (
                <>
                    <ContentDetail className="col-start-2 col-end-8 tb:col-start-1 tb:-col-end-1 tb:row-start-2" />
                    <Order
                        className="relative col-start-8 col-end-12 tb:col-start-1 tb:-col-end-1 tb:row-start-1"
                        marketData={marketDataQuery.data}
                    />
                    <ListCardData
                        isSmallTitle
                        title="Similar Casks"
                        lists={displayCasks}
                        type="cask"
                        className="col-start-2 col-end-12 mt-16 tb:col-start-1 tb:-col-end-1 tb:mt-8 tb:contain-paint mb:-mx-4 mb:mt-6 mb:px-4 mb:pb-0"
                        isDisableViewAll
                    />
                </>
            )}
        </div>
    );
}

export const DialogPopup = () => {
    const { isOpenDialogVerify, setIsOpenDialogVerify, dialogType } =
        useCaskDetail();

    return (
        <Dialog open={isOpenDialogVerify} onOpenChange={setIsOpenDialogVerify}>
            <DialogContent>{RenderDialog()?.[dialogType]?.()}</DialogContent>
        </Dialog>
    );
};
export const RenderDialog = () => {
    const { setIsOpenDialogVerify } = useCaskDetail();
    return {
        verify: () => (
            <div>
                <DialogHeader>
                    <DialogTitle>Verify your email</DialogTitle>
                </DialogHeader>
                <PopupVerify
                    description="Verify your email to start investing in casks."
                    action={() => setIsOpenDialogVerify(false)}
                    isDisableButton={false}
                    buttonText="Verify"
                />
            </div>
        ),
        send: () => (
            <>
                <DialogTitle className="sr-only">
                    Check your mailbox
                </DialogTitle>
                <AuthStatus
                    status="resend"
                    title="Check your mailbox"
                    buttonText="Got it"
                    action={() => setIsOpenDialogVerify(false)}
                    isDisableButton={false}
                >
                    Please follow the instructions in your mailbox to verify
                    your account. If you don’t see it, check your spam folder or
                    your credentials.
                </AuthStatus>
            </>
        ),
        addBank: () => (
            <div>
                <DialogHeader>
                    <DialogTitle>Add Your Payout Method</DialogTitle>
                </DialogHeader>
                <PopupOnboarding
                    description="Add your payout method first so we can send you the funds from your sale."
                    isDisableButton={false}
                    buttonText="Add payout method"
                    className="w-full"
                />
            </div>
        ),
    };
};

export default function CaskDetailModule({ id }: { id: string }) {
    return (
        <SidebarProvider>
            <CaskDetailProvider>
                <CaskDetailContent id={id}>
                    <RenderSidebar id={id} />
                </CaskDetailContent>
                <DialogPopup />
            </CaskDetailProvider>
        </SidebarProvider>
    );
}

const RenderSidebar = ({ id }: { id: string }) => {
    const { sidebarCurrent } = useCaskDetail();
    if (!sidebarCurrent) return null;
    return SidebarListing?.(id)?.[sidebarCurrent];
};

const SidebarListing = (id: string) => {
    return {
        [SIDEBAR_TABS.MARKET]: (
            <SideBarCaskListing
                side="right"
                iconHead={() => <IconHome />}
                title="Market Data"
                footer={<CaskDetailMarketFooter />}
            >
                <MarketTab id={id} />
            </SideBarCaskListing>
        ),
        [SIDEBAR_TABS.BUY_NOW]: (
            <SideBarCaskListing
                width="32.5rem"
                side="right"
                iconHead={() => <IconCoin />}
                title="Buy Now"
                footer={<BuyNowFooter id={id} />}
            >
                <BuyNow id={id} />
            </SideBarCaskListing>
        ),
        [SIDEBAR_TABS.CONFIRM_BUY_NOW]: (
            <SideBarCaskListing
                width="32.5rem"
                side="right"
                title="Confirm Order"
                iconHead={() => <IconCoin />}
                footer={<ConfirmBuyNowFooter id={id} />}
            >
                <ConfirmBuyNow id={id} />
            </SideBarCaskListing>
        ),
        [SIDEBAR_TABS.PLACE_BID]: (
            <SideBarCaskListing
                width="32.5rem"
                side="right"
                iconHead={() => <IconCoinB />}
                title="Place Bid"
                footer={<PlayBidFooter />}
            >
                <PlayBid id={id} />
            </SideBarCaskListing>
        ),
        [SIDEBAR_TABS.CONFIRM_BID]: (
            <SideBarCaskListing
                width="32.5rem"
                side="right"
                title="Confirm Bid"
                iconHead={() => <IconCoinB />}
                footer={<ConfirmBidFooter id={id} />}
            >
                <ConfirmBid id={id} />
            </SideBarCaskListing>
        ),
        [SIDEBAR_TABS.CONFIRM_ASK]: (
            <SideBarCaskListing
                width="32.5rem"
                side="right"
                title="Confirm Ask"
                footer={<ConfirmAskFooter id={id} />}
            >
                <ConfirmAsk id={id} />
            </SideBarCaskListing>
        ),
        [SIDEBAR_TABS.PLACE_ASK]: (
            <SideBarCaskListing
                width="32.5rem"
                side="right"
                title="Place Ask"
                footer={<PlaceAskFooter id={id} />}
            >
                <PlaceAsk id={id} />
            </SideBarCaskListing>
        ),
        [SIDEBAR_TABS.SELL_NOW]: (
            <SideBarCaskListing
                width="32.5rem"
                side="right"
                title="Sell Now"
                footer={<SellNowFooter id={id} />}
            >
                <SellNow id={id} />
            </SideBarCaskListing>
        ),
        [SIDEBAR_TABS.CONFIRM_SELL_NOW]: (
            <SideBarCaskListing
                width="32.5rem"
                side="right"
                title="Confirm Sell Now"
                footer={<ConfirmSellNowFooter id={id} />}
            >
                <ConfirmSellNow id={id} />
            </SideBarCaskListing>
        ),
    };
};

export type TSidebarListing = keyof ReturnType<typeof SidebarListing>;

const CaskDetailMarketFooter = () => {
    const { setSidebarCurrent, preSidebar, isHaveBack } = useCaskDetail();
    const handleBack = () => {
        if (preSidebar) {
            setSidebarCurrent(preSidebar);
        }
    };
    return (
        <MarketTabFooter
            onBack={handleBack}
            showBack={!!preSidebar && !isHaveBack}
        />
    );
};
