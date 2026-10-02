"use client";

import React, { useMemo } from "react";
import ListCardData, { ListCardSkeleton } from "@/components/shared/list-casks";
import { useQuery } from "@tanstack/react-query";
import classificationsServices from "@/services/classifications";
import { CLASSIFICATION_KEYS } from "@/lib/constants/key";
import { TCategory } from "@/components/shared/category-card";

const BrowseByCategory = () => {
    const {
        data: browseClassifications,
        isLoading,
        isError,
    } = useQuery({
        queryKey: [CLASSIFICATION_KEYS.BROWSE],
        queryFn: () => classificationsServices.getBrowseClassifications(),
    });
    const categoryList: TCategory[] = useMemo(() => {
        if (!browseClassifications?.data) return [];
        return browseClassifications.data.map((item) => {
            const medPrice = item.medianPrice ?? item.estMedianPrice ?? 0;
            const trendVal = item.medianPriceDelta30D;
            let trend = "";
            if (trendVal != null) {
                trend = `${trendVal > 0 ? "+" : ""}${trendVal.toFixed(1)}% (30D)`;
            }

            return {
                id: item.classificationId,
                name: item.label,
                imageUrl: item.imageUrl || undefined,
                isTrending: item.isTrending,
                medPrice,
                trend,
            };
        });
    }, [browseClassifications]);

    if (isLoading) {
        return (
            <div className="bg-transparent">
                <ListCardSkeleton type="category" />
            </div>
        );
    }

    if (isError || categoryList.length === 0) {
        return null;
    }

    return (
        <div className="bg-transparent">
            <ListCardData
                type="category"
                lists={categoryList.toSorted(
                    (a, b) =>
                        Number(Boolean(b.isTrending)) -
                        Number(Boolean(a.isTrending))
                )}
                opts={{
                    align: "start",
                    slidesToScroll: 1,
                    loop: categoryList.length > 4,
                }}
                title="Browse by Category"
                isDisableViewAll
                pagination
                className="overflow-hidden pb-[3.25rem] pt-0 tb:-mx-[var(--padding-container)] tb:px-[var(--padding-container)] tb:pb-8 mb:pb-8 [&_*[data-dot-active='true']]:!bg-bd-inverse [&_*[data-dot='true']]:bg-bd-surface"
            />
        </div>
    );
};

export default BrowseByCategory;
