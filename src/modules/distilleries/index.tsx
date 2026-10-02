"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Banner from "./banner";
import Content from "./content";
import FormFilter from "./filter";
import { DistilleriesProvider, useDistilleriesContext } from "./provider";
import { SideBarCaskListing } from "./sidebar";

export default function DistilleriesModule({
    sortBy,
    search,
}: {
    sortBy: string;
    search: string;
}) {
    return (
        <SidebarProvider>
            <DistilleriesProvider>
                <DistilleriesContent sortBy={sortBy} search={search} />
            </DistilleriesProvider>
        </SidebarProvider>
    );
}

const DistilleriesContent = ({
    sortBy,
    search,
}: {
    sortBy: string;
    search: string;
}) => {
    const { isSidebarCollapsed } = useDistilleriesContext();

    return (
        <div className="flex w-full flex-col">
            <Banner />
            <div className="container relative flex flex-row items-start mb:flex-col">
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

                <div className="ease-[cubic-bezier(0.34,1.56,0.64,1)] min-h-full min-w-0 flex-1 transition-all duration-300">
                    <Content sortBy={sortBy} search={search} />
                </div>
            </div>
        </div>
    );
};
