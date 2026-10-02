import SidebarListing from "@/components/shared/sidebar-listing";
import { useContext } from "react";
import { MarketplaceContext } from "../provider";

type TSidebarProps = {
    side?: "left" | "right";
    iconHead?: () => React.ReactNode;
    title?: string;
    children: React.ReactNode;
    className?: string;
    width?: string;
    footer?: React.ReactNode;
};

export default function SideBarCaskListing(props: TSidebarProps) {
    const marketplaceContext = useContext(MarketplaceContext);

    const handleClose = () => {
        if (marketplaceContext) {
            marketplaceContext.toggleSidebar();
        }
    };

    return <SidebarListing {...props} onClose={handleClose} />;
}
