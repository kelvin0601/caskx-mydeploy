"use client";

import CaskCardItem, { CaskCardSkeleton } from "@/components/shared/cask-card";
import DistilleryCardDetail, {
    DistilleryCardDetailSkeleton,
} from "@/components/shared/distillery-card-if";
import CaskEmpty from "@/components/shared/cask-notfound";
import { cn } from "@/lib/utils";
import { caskMaster, distillery } from "@/types";

type TSearchResultsGridProps = {
    activeTab: "cask" | "distillery";
    casks: caskMaster.TCaskMaster[];
    distilleries: distillery.TDistillery[];
    isLoading?: boolean;
    className?: string;
    onClear?: () => void;
};

export default function SearchResultsGrid({
    activeTab,
    casks,
    distilleries,
    isLoading,
    className,
    onClear,
}: TSearchResultsGridProps) {
    if (isLoading) {
        return (
            <div
                className={cn(
                    "grid grid-cols-4 gap-4 pb-8 pt-4 tb:grid-cols-2 tb:gap-3 tb:pb-5 tb:pt-4 mb:grid-cols-1 mb:gap-2 mb:py-4",
                    className
                )}
            >
                {Array.from({ length: 12 }).map((i, index) =>
                    activeTab === "cask" ? (
                        <CaskCardSkeleton key={index} />
                    ) : (
                        <DistilleryCardDetailSkeleton key={index} />
                    )
                )}
            </div>
        );
    }

    if (activeTab === "cask") {
        if (!casks || casks.length === 0) {
            return <CaskEmpty onClear={onClear} />;
        }

        return (
            <div
                className={cn(
                    "grid grid-cols-4 gap-4 pb-8 pt-4 tb:grid-cols-2 tb:gap-3 tb:pb-5 tb:pt-4 mb:grid-cols-1 mb:gap-2 mb:py-4",
                    className
                )}
            >
                {casks.map((item, index) => (
                    <CaskCardItem
                        key={item.id}
                        data={item}
                        className="w-full"
                        isRevert={false}
                        index={index}
                    />
                ))}
            </div>
        );
    } else {
        if (!distilleries || distilleries.length === 0) {
            return <CaskEmpty onClear={onClear} />;
        }

        return (
            <div
                className={cn(
                    "grid grid-cols-4 gap-4 pb-8 pt-4 tb:grid-cols-2 tb:gap-3 tb:pb-5 tb:pt-4 mb:grid-cols-1 mb:gap-2 mb:py-4",
                    className
                )}
            >
                {distilleries.map((item) => (
                    <DistilleryCardDetail
                        key={item.id}
                        data={item}
                        className="h-full w-full"
                    />
                ))}
            </div>
        );
    }
}
