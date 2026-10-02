import { useContext } from "react";
import { DistilleriesContext } from "../provider";
import SidebarListing from "@/components/shared/sidebar-listing";

type TSidebarProps = {
    side?: "left" | "right";
    iconHead?: () => React.ReactNode;
    title?: string;
    children: React.ReactNode;
    className?: string;
    width?: string;
    footer?: React.ReactNode;
};

export function SideBarCaskListing(props: TSidebarProps) {
    const distilleriesContext = useContext(DistilleriesContext);

    const handleClose = () => {
        if (distilleriesContext) {
            distilleriesContext.toggleSidebar();
        }
    };

    return (
        <SidebarListing {...props} bgClass="bg-bg-sf3" onClose={handleClose} />
    );
}
