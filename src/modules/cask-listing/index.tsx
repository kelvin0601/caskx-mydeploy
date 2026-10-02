"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Content from "./content";
import FormFilter from "./filter";
import { MarketplaceProvider, useMarketplace } from "./provider";
import SideBarCaskListing from "./sidebar";

export default function CaskListingModule({
    sortBy,
    search,
}: {
    sortBy: string;
    search: string;
}) {
    return (
        <SidebarProvider>
            <MarketplaceProvider>
                <CaskListingContent sortBy={sortBy} search={search} />
            </MarketplaceProvider>
        </SidebarProvider>
    );
}

const CaskListingContent = ({
    sortBy,
    search,
}: {
    sortBy: string;
    search: string;
}) => {
    const { isSidebarCollapsed, toggleSidebar } = useMarketplace();

    return (
        <div className="flex w-full flex-col">
            <div className="container flex flex-col gap-2 border-b border-bd-main px-10 py-10 tb:py-8 mb:py-6">
                <h1 className="font-reckless text-3xl font-medium leading-none text-typo-primary tb:text-2xl mb:text-xl">
                    Marketplace
                </h1>
                <p className="font-inter text-base font-normal text-typo-soft mb:text-sm">
                    Top products from distilleries around the world.
                </p>
            </div>
            <div className="container relative mx-auto flex flex-row items-start mb:flex-col">
                <SideBarCaskListing
                    className={cn(
                        "ease-[cubic-bezier(0.34,1.56,0.64,1)] z-[25] transition-all duration-300",
                        "sticky top-[var(--height-header)] h-[calc(100vh-var(--height-header))] overflow-hidden border-bd-main header-hidden:top-0 header-hidden:h-screen tb:hidden",
                        isSidebarCollapsed
                            ? "w-0 border-r-0 opacity-0"
                            : "w-[25.5rem] border-r opacity-100"
                    )}
                >
                    <FormFilter />
                </SideBarCaskListing>

                <div className="ease-[cubic-bezier(0.34,1.56,0.64,1)] mb- 6 min-h-full min-w-0 flex-1 transition-all duration-300">
                    <Content sortBy={sortBy} search={search} />
                </div>
            </div>
        </div>
    );
};
