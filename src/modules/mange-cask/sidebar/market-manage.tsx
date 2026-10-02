import { MarketTabFooter } from "@/modules/cask-master-detail/market-tab";
import { useManageCask } from "../provider";

const ManageMarketFooter = () => {
    const { setSidebarCurrent, preSidebar } = useManageCask();
    const handleBack = () => {
        if (preSidebar) {
            setSidebarCurrent(preSidebar);
        }
    };
    return <MarketTabFooter onBack={handleBack} showBack={!!preSidebar} />;
};

export default ManageMarketFooter;
