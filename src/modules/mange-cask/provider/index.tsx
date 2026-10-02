import { useSidebar } from "@/components/ui/sidebar";
import {
    ETransactionHistoryStatus,
    ETransactionOnGoingStatus,
    ETransactionStatus,
    ETransactionType,
} from "@/enum/transaction";
import { ROUTE_PUBLIC, SIDEBAR_TABS, TSidebarTabs } from "@/lib/constants";
import { caskAsk } from "@/types/cask-ask";
import { transaction } from "@/types/transaction";
import { usePathname } from "next/navigation";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { TAlertType } from "../alert";
import { TDialogType } from "../dialog";

export type TBidData = {
    caskId?: string;
    id?: string;
    caskName?: string;
    bidId?: string;
    askId?: string;
    quantity?: number;
    price?: number;
    total?: number;
    bidType?: ETransactionType;
    askType?: ETransactionType;
    status?:
        | ETransactionStatus
        | ETransactionOnGoingStatus
        | ETransactionHistoryStatus;
    expiredAt?: string;
    content?: string;
    titleButtonConfirm?: string;
    titleButtonCancel?: string;
    actionConfirm?: () => void;
    actionCancel?: () => void;
};
export type TSortBy =
    | "status"
    | "quantity"
    | "type"
    | "dueBy"
    | "subtotal"
    | "expirationDate"
    | "purchaseDate"
    | "unitPrice"
    | "totalPrice"
    | "totalPaid"
    | "step"
    | "";

// Bid action types used by the bid manager

type TDialogData = TBidData & {
    [key: string]: unknown;
    transactions?: transaction.TTransaction[];
    type: "bid" | "ask";
};

type TContext = {
    // Sidebar state
    sidebarCurrent: TSidebarTabs | null;
    preSidebar: TSidebarTabs | null;
    setSidebarCurrent: (sidebarCurrent: TSidebarTabs | null) => void;

    // Dialog state
    dialogType: TDialogType;
    isOpenDialog: boolean;
    setIsOpenDialog: (isOpenDialog: boolean) => void;
    setDialogType: (dialogType: TDialogType) => void;

    // Bid management state
    isOpenBidManager: boolean;
    isConfirmed: boolean;
    dialogData: TDialogData;
    bidActionType: TAlertType;
    setDialogData: (data?: Partial<TDialogData>) => void;
    setOpenBidManager: (isOpen: boolean) => void;
    setIsConfirmed: (isConfirmed: boolean) => void;
    setBidActionType: (type: TAlertType) => void;
    openBidAction: (type: TAlertType, data?: TBidData) => void;

    // Transaction state
    idTransaction: string | null;
    setIdTransaction: (idTransaction: string | null) => void;

    // Filters state
    filters: caskAsk.TOrderListFilters;
    setFilters: (filters: caskAsk.TOrderListFilters) => void;
    // Split filter states for performance-sensitive consumers
    search: string;
    setSearch: (value: string) => void;
    status: string;
    setStatus: (value: string) => void;
    page: number;
    setPage: (value: number) => void;
    limit: number;
    step: string;
    setStep: (value: string) => void;
    setLimit: (value: number) => void;
    sortBy: TSortBy | undefined;
    setSortBy: (value: TSortBy) => void;
    order: "asc" | "desc";
    setOrder: (value: "asc" | "desc") => void;
    // Reset state function
    resetFilters: () => void;
};

const initialBidData: TBidData = {
    content: "",
    titleButtonConfirm: "Confirm",
    titleButtonCancel: "Cancel",
    actionConfirm: () => {},
    actionCancel: () => {},
};

const initialState: TContext = {
    // Sidebar state
    sidebarCurrent: null,
    preSidebar: null,
    filters: {
        status: "",
        search: "",
        size: 10,
        limit: 10,
        page: 1,
        sortBy: undefined,
        order: "desc",
    },
    setFilters: () => {},
    search: "",
    setSearch: () => {},
    status: "",
    setStatus: () => {},
    step: "",
    setStep: () => {},
    page: 1,
    setPage: () => {},
    limit: 10,
    setLimit: () => {},
    sortBy: "status",
    setSortBy: () => {},
    order: "desc",
    setOrder: () => {},
    setSidebarCurrent: () => {},
    resetFilters: () => {},

    // Dialog state
    dialogType: "view_transaction",
    isOpenDialog: false,
    setDialogType: () => {},
    setIsOpenDialog: () => {},

    // Bid management state
    isOpenBidManager: false,
    isConfirmed: false,
    dialogData: {
        ...initialBidData,
        type: "bid",
    } as TDialogData,
    bidActionType: "confirm",
    setDialogData: () => {},
    setOpenBidManager: () => {},
    setIsConfirmed: () => {},
    setBidActionType: () => {},
    openBidAction: () => {},

    // Transaction state
    idTransaction: null,
    setIdTransaction: () => {},
};

export const BuyingContext = createContext<TContext>(initialState);

export const useManageCask = () => {
    const context = useContext(BuyingContext);
    if (!context) {
        throw new Error("useManageCask must be used within a BuyingProvider");
    }
    return context;
};

export function ManageCask({ children }: { children: React.ReactNode }) {
    // Sidebar state
    // Split filter states for finer-grained updates
    const [search, setSearch] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [step, setStep] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [sortBy, setSortBy] = useState<TSortBy>("status");
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [sidebarCurrent, setSidebarCurrent] = useState<TSidebarTabs | null>(
        null
    );
    const pathname = usePathname();
    const [preSidebar, setPreSidebar] = useState<TSidebarTabs | null>(null);
    const { open, setOpen } = useSidebar();

    // Dialog state
    const [dialogType, setDialogType] =
        useState<TDialogType>("view_transaction");
    const [isOpenDialog, setIsOpenDialog] = useState(false);

    // Bid management state
    const [isOpenBidManager, setOpenBidManager] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [bidActionType, setBidActionType] = useState<TAlertType>("confirm");
    const [dialogData, setDialogData] = useState<TDialogData>({
        ...initialBidData,
        type: "bid",
    });

    // Transaction state
    const [idTransaction, setIdTransaction] = useState<string | null>(null);

    const handleSetSidebar = useCallback(
        async (sidebarNew: TSidebarTabs | null) => {
            if (!open) {
                setSidebarCurrent(sidebarNew);
                if (sidebarCurrent === null) {
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    setOpen(true);
                } else {
                    setOpen(true);
                }
                if (sidebarNew !== SIDEBAR_TABS.UPDATE_BID) {
                    setPreSidebar(sidebarNew);
                } else if (
                    pathname.includes(ROUTE_PUBLIC.MANAGE_BIDS) ||
                    pathname.includes(ROUTE_PUBLIC.MANAGE_ASKS)
                ) {
                    setPreSidebar(sidebarNew);
                }
            } else {
                setOpen(false);
                await new Promise((resolve) => setTimeout(resolve, 500));
                setSidebarCurrent(sidebarNew);
                setOpen(true);
            }
        },
        [open, pathname]
    );

    const setDialogDataCallback = useCallback(
        (newData?: Partial<TDialogData>) => {
            return setDialogData((prev) => {
                return {
                    ...prev,
                    ...newData,
                };
            });
        },
        []
    );

    const openBidAction = useCallback(
        (actionType: TAlertType, actionData?: TBidData) => {
            setBidActionType(actionType);
            if (actionData) {
                setDialogDataCallback(actionData);
            }
            setOpenBidManager(true);
        },
        [setDialogDataCallback]
    );

    // Compose derived filters object
    const filters = useMemo(() => {
        return {
            search,
            page,
            limit,
            size: limit,
            ...(status && { status }),
            ...(step && { step }),
            ...(sortBy && { sortBy }),
            ...(order && { order }),
        } as caskAsk.TOrderListFilters;
    }, [status, step, search, page, limit, sortBy, order]);

    // Provide a stable setFilters that updates split states
    const setFilters = useCallback((next: caskAsk.TOrderListFilters) => {
        if (typeof next.status !== "undefined")
            setStatus(next.status as string);
        if (typeof next.search !== "undefined")
            setSearch(next.search as string);
        if (typeof next.step !== "undefined") setStep(next.step as string);
        if (typeof next.page !== "undefined") setPage(next.page as number);
        // Support both limit/size just in case of legacy usage
        if (typeof next.limit !== "undefined") setLimit(next.limit as number);
        if (typeof next.size !== "undefined") setLimit(next.size as number);
        if (typeof next.sortBy !== "undefined")
            setSortBy(next.sortBy as TSortBy);
        if (typeof next.order !== "undefined")
            setOrder(next.order as "asc" | "desc");
        if (typeof next.step !== "undefined") setStep(next.step as string);
    }, []);

    // Reset all filters to initial state
    const resetFilters = useCallback(() => {
        setSearch("");
        setStatus("");
        setPage(1);
        setLimit(10);
        setSortBy("status");
        setOrder("desc");
        setStep("");
    }, []);

    const contextValue = useMemo(
        () => ({
            // Sidebar state
            sidebarCurrent,
            preSidebar,
            setSidebarCurrent: handleSetSidebar,
            filters,
            setFilters,
            search,
            setSearch,
            status,
            setStatus,
            step,
            setStep,
            page,
            setPage,
            limit,
            setLimit,
            sortBy,
            setSortBy: (v: TSortBy) => setSortBy(v),
            order,
            setOrder,
            resetFilters,
            // Dialog state
            dialogType,
            isOpenDialog,
            setDialogType,
            setIsOpenDialog,

            // Bid management state
            isOpenBidManager,
            isConfirmed,
            dialogData,
            bidActionType,
            setDialogData: setDialogDataCallback,
            setOpenBidManager,
            setIsConfirmed,
            setBidActionType,
            openBidAction,
            // Transaction state
            idTransaction,
            setIdTransaction,
        }),
        [
            sidebarCurrent,
            preSidebar,
            handleSetSidebar,
            filters,
            setFilters,
            search,
            status,
            page,
            limit,
            sortBy,
            order,
            dialogType,
            isOpenDialog,
            setDialogType,
            setIsOpenDialog,
            isOpenBidManager,
            isConfirmed,
            dialogData,
            bidActionType,
            setDialogDataCallback,
            setOpenBidManager,
            setIsConfirmed,
            setBidActionType,
            openBidAction,
            idTransaction,
            resetFilters,
        ]
    );

    return (
        <BuyingContext.Provider value={contextValue}>
            {children}
        </BuyingContext.Provider>
    );
}

export { SIDEBAR_TABS };
