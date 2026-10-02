import { useSidebar } from "@/components/ui/sidebar";
import { SIDEBAR_TABS } from "@/lib/constants";
import { useCheckout } from "@/store/checkout";
import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";
import { RenderDialog, TSidebarListing } from "..";

type TDialogType = keyof ReturnType<typeof RenderDialog>;
type TContext = {
    sidebarCurrent: TSidebarListing | null;
    preSidebar: TSidebarListing | null;
    isOpenDialogVerify: boolean;
    dialogType: TDialogType;
    setSidebarCurrent: (
        sidebarCurrent: TSidebarListing | null,
        isHaveBack?: boolean
    ) => void;
    setIsOpenDialogVerify: (isOpenDialogVerify: boolean) => void;
    setDialogType: (dialogType: TDialogType) => void;
    isHaveBack: boolean;
    setIsHaveBack: (isHaveBack: boolean) => void;
};

const initialState: TContext = {
    sidebarCurrent: null,
    preSidebar: null,
    dialogType: "verify",
    isOpenDialogVerify: false,
    isHaveBack: false,
    setDialogType: () => {},
    setSidebarCurrent: () => {},
    setIsOpenDialogVerify: () => {},
    setIsHaveBack: () => {},
};
export const CaskDetailContext = createContext<TContext>(initialState);

export const useCaskDetail = () => {
    const context = useContext(CaskDetailContext);
    if (!context) {
        throw new Error(
            "useCaskDetail must be used within a CaskDetailProvider"
        );
    }
    return context;
};

export function CaskDetailProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarCurrent, setSidebarCurrent] =
        useState<TSidebarListing | null>(SIDEBAR_TABS.MARKET);
    const [isHaveBack, setIsHaveBack] = useState(false);
    const [preSidebar, setPreSidebar] = useState<TSidebarListing | null>(null);
    const [dialogType, setDialogType] = useState<TDialogType>("verify");
    const { open, setOpen } = useSidebar();
    const [isOpenDialogVerify, setIsOpenDialogVerify] = useState(false);
    const refTimer = useRef<NodeJS.Timeout | null>(null);
    const { reset } = useCheckout();

    const handleSetSidebar = useCallback(
        async (
            sidebarCurrent: TSidebarListing | null,
            isHaveBack?: boolean
        ) => {
            if (!open) {
                setOpen(true);
                if (sidebarCurrent !== SIDEBAR_TABS.MARKET) {
                    setPreSidebar(sidebarCurrent);
                }
                setSidebarCurrent(sidebarCurrent);
                if (sidebarCurrent !== SIDEBAR_TABS.MARKET) {
                    reset();
                }
            } else {
                if (refTimer.current) clearTimeout(refTimer.current);
                setOpen(false);
                await new Promise((resolve) => setTimeout(resolve, 500));
                setSidebarCurrent(sidebarCurrent);
                setOpen(true);
            }
            setIsHaveBack(isHaveBack || false);
        },
        [open, setOpen, reset, sidebarCurrent, isHaveBack]
    );

    return (
        <CaskDetailContext.Provider
            value={{
                sidebarCurrent,
                preSidebar,
                setSidebarCurrent: handleSetSidebar,
                isOpenDialogVerify,
                setIsOpenDialogVerify,
                dialogType,
                setDialogType,
                isHaveBack,
                setIsHaveBack,
            }}
        >
            {children}
        </CaskDetailContext.Provider>
    );
}
