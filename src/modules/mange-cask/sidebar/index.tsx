import IconCoinB from "@/components/shared/icons/icon-coin-b";
import MarketTab from "@/modules/cask-master-detail/market-tab";
import SidebarListing from "@/components/shared/sidebar-listing";
import { SIDEBAR_TABS, useManageCask } from "../provider";
import ConfirmAskManage, { ConfirmAskManageFooter } from "./confirm-ask";
import ConfirmBidManage, { ConfirmBidManageFooter } from "./confirm-bid";
import ManageMarketFooter from "./market-manage";
import UpdateAsk, { UpdateAskFooter } from "./update-ask";
import UpdateBid, { UpdateBidFooter } from "./update-bid";

const RenderSidebarContent = ({
    idTransaction,
    updateId,
    caskId,
    onClose,
}: {
    idTransaction: string | null;
    updateId?: string;
    caskId?: string;
    onClose?: () => void;
}) => {
    if (!idTransaction) {
        return null;
    }
    return {
        [SIDEBAR_TABS.UPDATE_BID]: (
            <SidebarListing
                side="right"
                iconHead={() => <IconCoinB />}
                title="Updated Bid"
                width="32.5rem"
                footer={<UpdateBidFooter id={idTransaction} />}
                onClose={onClose}
            >
                {idTransaction && <UpdateBid id={idTransaction} />}
            </SidebarListing>
        ),
        [SIDEBAR_TABS.CONFIRM_BID]: (
            <SidebarListing
                side="right"
                iconHead={() => <IconCoinB />}
                title="Confirm Bid"
                width="32.5rem"
                footer={
                    <ConfirmBidManageFooter
                        bidId={updateId as string}
                        caskId={caskId as string}
                    />
                }
                onClose={onClose}
            >
                {idTransaction && <ConfirmBidManage id={idTransaction} />}
            </SidebarListing>
        ),
        [SIDEBAR_TABS.UPDATE_ASK]: (
            <SidebarListing
                side="right"
                iconHead={() => <IconCoinB />}
                title="Updated Ask"
                width="32.5rem"
                footer={<UpdateAskFooter id={idTransaction} />}
                onClose={onClose}
            >
                {idTransaction && <UpdateAsk id={idTransaction} />}
            </SidebarListing>
        ),
        [SIDEBAR_TABS.CONFIRM_ASK]: (
            <SidebarListing
                side="right"
                iconHead={() => <IconCoinB />}
                title="Confirm Ask"
                width="32.5rem"
                footer={<ConfirmAskManageFooter askId={updateId as string} />}
                onClose={onClose}
            >
                {idTransaction && <ConfirmAskManage id={idTransaction} />}
            </SidebarListing>
        ),
        [SIDEBAR_TABS.MARKET]: (
            <SidebarListing
                side="right"
                iconHead={() => <IconCoinB />}
                title="Market Data"
                width="32.5rem"
                footer={<ManageMarketFooter />}
                onClose={onClose}
            >
                {idTransaction && <MarketTab id={idTransaction} />}
            </SidebarListing>
        ),
    };
};

const BuyingSidebar = () => {
    const { sidebarCurrent, idTransaction, dialogData, setSidebarCurrent } =
        useManageCask();
    if (!sidebarCurrent) return null;
    return (
        RenderSidebarContent({
            idTransaction,
            caskId: dialogData.caskId,
            updateId: dialogData.id,
            onClose: () => setSidebarCurrent(null),
        })?.[sidebarCurrent] ?? null
    );
};

export default BuyingSidebar;
