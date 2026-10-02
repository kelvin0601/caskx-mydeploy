import IconClose from "@/components/shared/icons/icon-close";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";
import useResponsive from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";
import { useRef } from "react";

type TSidebarProps = {
    side?: "left" | "right";
    iconHead?: () => React.ReactNode;
    title?: string;
    children: React.ReactNode;
    className?: string;
    width?: string;
    footer?: React.ReactNode;
    onClose?: () => void;
    bgClass?: string;
};

export default function SidebarListing(props: TSidebarProps) {
    const {
        side,
        className,
        children,
        width = "24rem",
        footer,
        onClose,
        bgClass = "bg-bg-main",
    } = props;
    const { isMobile, isTablet } = useResponsive();
    const isMobileOrTablet = isMobile || isTablet;
    const { setOpenMobile } = useSidebar();
    const wrapSidebarRef = useRef<HTMLDivElement | null>(null);

    const handleClose = () => {
        if (isMobileOrTablet) {
            setOpenMobile(false);
        }
        if (onClose) {
            onClose();
        }
    };

    return (
        <Sidebar
            ref={wrapSidebarRef}
            side={side}
            className={cn("border-bd-main", bgClass, className)}
            width={width}
            collapsible={isMobileOrTablet ? "offcanvas" : "none"}
        >
            <div className="hidden w-full flex-col items-end tb:flex mb:hidden">
                <Button
                    variant={"empty"}
                    onClick={handleClose}
                    className="size-10 p-0 text-icon-main"
                >
                    <div className="size-5">
                        <IconClose />
                    </div>
                </Button>
            </div>
            <SidebarContent className={cn("h-full", bgClass)}>
                {children}
            </SidebarContent>
            {footer && (
                <SidebarFooter className={bgClass}>{footer}</SidebarFooter>
            )}
        </Sidebar>
    );
}
