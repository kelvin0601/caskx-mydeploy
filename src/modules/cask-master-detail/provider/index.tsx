import { SIDEBAR_TABS } from "@/lib/constants";
import {
    useMarketOrderFlowActions,
    useMarketOrderFlowState,
} from "@/modules/market-orders/flow/provider";
import {
    MarketOrderIntent,
    MarketOrderStep,
} from "@/modules/market-orders/flow/types";
import {
    MARKET_ORDER_INTENT,
    MARKET_ORDER_STEP,
} from "@/modules/market-orders/constants";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { RenderDialog, TSidebarListing } from "..";

type DialogType = keyof ReturnType<typeof RenderDialog>;

type CaskDetailContextValue = {
    isOpenDialogVerify: boolean;
    dialogType: DialogType;
    setIsOpenDialogVerify: (isOpen: boolean) => void;
    setDialogType: (dialogType: DialogType) => void;
    isDrawerLoading: boolean;
    setLoadingState: (key: string, isLoading: boolean) => void;
    drawerOpen: boolean;
    drawerCurrent: TSidebarListing | null;
    setSidebarCurrent: (
        tab: TSidebarListing | null,
        isHaveBack?: boolean
    ) => void;
    setDrawerOpen: (open: boolean) => void;
};

const FLOW_DRAWER_TABS: Record<
    MarketOrderIntent,
    Record<MarketOrderStep, TSidebarListing>
> = {
    [MARKET_ORDER_INTENT.BUY_NOW]: {
        [MARKET_ORDER_STEP.EDIT]: SIDEBAR_TABS.BUY_NOW,
        [MARKET_ORDER_STEP.CONFIRM]: SIDEBAR_TABS.CONFIRM_BUY_NOW,
    },
    [MARKET_ORDER_INTENT.PLACE_BID]: {
        [MARKET_ORDER_STEP.EDIT]: SIDEBAR_TABS.PLACE_BID,
        [MARKET_ORDER_STEP.CONFIRM]: SIDEBAR_TABS.CONFIRM_BID,
    },
    [MARKET_ORDER_INTENT.SELL_NOW]: {
        [MARKET_ORDER_STEP.EDIT]: SIDEBAR_TABS.SELL_NOW,
        [MARKET_ORDER_STEP.CONFIRM]: SIDEBAR_TABS.CONFIRM_SELL_NOW,
    },
    [MARKET_ORDER_INTENT.PLACE_ASK]: {
        [MARKET_ORDER_STEP.EDIT]: SIDEBAR_TABS.PLACE_ASK,
        [MARKET_ORDER_STEP.CONFIRM]: SIDEBAR_TABS.CONFIRM_ASK,
    },
};

const DRAWER_FLOW_STATE: Partial<
    Record<
        TSidebarListing,
        { intent: MarketOrderIntent; step: MarketOrderStep }
    >
> = Object.fromEntries(
    Object.entries(FLOW_DRAWER_TABS).flatMap(([intent, tabs]) => [
        [tabs.edit, { intent, step: MARKET_ORDER_STEP.EDIT }],
        [tabs.confirm, { intent, step: MARKET_ORDER_STEP.CONFIRM }],
    ])
) as Partial<
    Record<
        TSidebarListing,
        { intent: MarketOrderIntent; step: MarketOrderStep }
    >
>;

const CaskDetailContext = createContext<CaskDetailContextValue | null>(null);

export function useCaskDetail() {
    const context = useContext(CaskDetailContext);
    if (!context) {
        throw new Error(
            "useCaskDetail must be used within a CaskDetailProvider"
        );
    }
    return context;
}

export function CaskDetailProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { intent, step } = useMarketOrderFlowState();
    const { startFlow, switchFlow, goToConfirm, backToEdit, closeFlow } =
        useMarketOrderFlowActions();
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerCurrent, setDrawerCurrent] = useState<TSidebarListing | null>(
        null
    );
    const [dialogType, setDialogType] = useState<DialogType>("verify");
    const [isOpenDialogVerify, setIsOpenDialogVerify] = useState(false);

    useEffect(() => {
        if (!intent) {
            setDrawerOpen(false);
            return;
        }

        setDrawerCurrent(FLOW_DRAWER_TABS[intent][step]);
        setDrawerOpen(true);
    }, [intent, step]);

    useEffect(() => {
        if (drawerOpen) return;

        const timer = setTimeout(() => setDrawerCurrent(null), 500);
        return () => clearTimeout(timer);
    }, [drawerOpen]);

    const setLoadingState = useCallback((key: string, isLoading: boolean) => {
        setLoadingMap((previous) => {
            if (previous[key] === isLoading) return previous;
            return { ...previous, [key]: isLoading };
        });
    }, []);

    const setSidebarCurrent = useCallback(
        (tab: TSidebarListing | null, _isHaveBack?: boolean) => {
            if (!tab || tab === SIDEBAR_TABS.MARKET) {
                closeFlow();
                return;
            }

            const next = DRAWER_FLOW_STATE[tab];
            if (!next) return;

            if (next.intent === intent) {
                if (next.step === MARKET_ORDER_STEP.CONFIRM) goToConfirm();
                else backToEdit();
                return;
            }

            if (intent) switchFlow(next.intent);
            else startFlow(next.intent);
            if (next.step === MARKET_ORDER_STEP.CONFIRM) goToConfirm();
        },
        [backToEdit, closeFlow, goToConfirm, intent, startFlow, switchFlow]
    );

    const setDrawerOpenCompat = useCallback(
        (open: boolean) => {
            if (!open) closeFlow();
        },
        [closeFlow]
    );

    const value = useMemo(
        () => ({
            isOpenDialogVerify,
            dialogType,
            setIsOpenDialogVerify,
            setDialogType,
            isDrawerLoading: Object.values(loadingMap).some(Boolean),
            setLoadingState,
            drawerOpen,
            drawerCurrent,
            setSidebarCurrent,
            setDrawerOpen: setDrawerOpenCompat,
        }),
        [
            dialogType,
            drawerCurrent,
            drawerOpen,
            isOpenDialogVerify,
            loadingMap,
            setLoadingState,
            setDrawerOpenCompat,
            setSidebarCurrent,
        ]
    );

    return (
        <CaskDetailContext.Provider value={value}>
            {children}
        </CaskDetailContext.Provider>
    );
}
