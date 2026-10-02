import ActionHeader from "../action";
import CaskList from "../list";
import { useMarketplace } from "../provider";
import { cn } from "@/lib/utils";

export default function Content({
    sortBy,
    search,
}: {
    sortBy: string;
    search: string;
}) {
    const { isSidebarCollapsed } = useMarketplace();

    return (
        <div className="relative flex h-full w-full flex-col">
            <div
                className={cn(
                    "sticky top-[var(--height-header)] z-20 -mr-[var(--padding-container)] border-b border-bd-main bg-bg-main transition-all duration-200 header-hidden:top-0 tb:-mx-[var(--padding-container)] tb:px-[var(--padding-container)]",
                    isSidebarCollapsed && "-ml-[var(--padding-container)]"
                )}
            >
                <ActionHeader />
            </div>
            <div
                className={cn(
                    "flex flex-1 pb-10 pl-6 pt-4 tb:pb-5 tb:pl-0 mb:pb-4",
                    isSidebarCollapsed && "pl-0"
                )}
            >
                <CaskList
                    sortBy={sortBy}
                    search={search}
                    isSidebarCollapsed={isSidebarCollapsed}
                />
            </div>
        </div>
    );
}
