import { CASK_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { cn } from "@/lib/utils";
import caskMasterServices from "@/services/cask-master";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import CaskCard, { CaskCardSkeleton } from "../cask-card";
import CaskFilterHeader, {
    CaskFilterHeaderSkeleton,
} from "../cask-filter-header";

type FilterOption = {
    label: string;
    value: string;
};

type CaskListSectionProps = {
    title: string;
    subTitle?: string;
    filters: FilterOption[];
    defaultFilter?: string;
    viewAllBaseHref?: string;
    className?: string;
    size: number;
};

const CaskListSection: React.FC<CaskListSectionProps> = ({
    title,
    subTitle,
    filters,
    defaultFilter,
    viewAllBaseHref = ROUTE_PUBLIC.CASK_DETAILS,
    className,
    size,
}) => {
    const [activeFilter, setActiveFilter] = useState(
        defaultFilter || filters[0]?.value
    );

    const { data, isLoading } = useQuery({
        queryKey: [CASK_KEYS.LIST_CASK, activeFilter],
        queryFn: () => caskMasterServices.getCaskMastersListing(activeFilter),
        enabled: !!activeFilter,
    });

    const lists = data?.data;

    return (
        <section className={cn("flex flex-col py-10 tb:py-8", className)}>
            {isLoading ? (
                <>
                    <CaskFilterHeaderSkeleton />
                    <div className="grid grid-cols-3 !gap-[var(--gap-x)] tb:grid-cols-2 mb:grid-cols-1">
                        {Array.from({ length: size }).map((_, i) => (
                            <CaskCardSkeleton key={i} />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <CaskFilterHeader
                        title={title}
                        filters={filters}
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        viewAllHref={`${viewAllBaseHref}?${activeFilter}`}
                        isLoading={isLoading}
                    />
                    <div className="grid grid-cols-3 !gap-[var(--gap-x)] tb:grid-cols-2 mb:grid-cols-1">
                        {lists?.map((cask, index) => (
                            <div key={cask.id}>
                                <CaskCard
                                    data={cask}
                                    index={index}
                                    isRevert={false}
                                    className="h-full w-full"
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default CaskListSection;
