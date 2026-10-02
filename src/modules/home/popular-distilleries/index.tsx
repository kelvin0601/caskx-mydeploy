"use client";

import React from "react";
import ListCardData, { ListCardSkeleton } from "@/components/shared/list-casks";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { DISTILLERY_KEYS } from "@/lib/constants/key";
import distilleriesServices from "@/services/distilleries";
import { useQuery } from "@tanstack/react-query";

const PopularDistilleries = () => {
    const distilleryQuery = useQuery({
        queryKey: [`${DISTILLERY_KEYS.TOP_DISTILLERIES}`],
        queryFn: distilleriesServices.getDistilleryTopRank,
    });

    return (
        <div className="relative -ml-[calc(var(--padding-container)+var(--size-open-container))] -mr-[calc(var(--gap-x))] bg-bg-sf2 pl-[calc(var(--padding-container)+var(--size-open-container))] pr-[calc(var(--gap-x))] tb:-mx-0 tb:px-0">
            <div className="absolute inset-x-0 bottom-0 z-10 h-px w-full border-b border-bd-main tb:-inset-x-[var(--padding-container)] tb:w-auto" />
            <div className="absolute -inset-x-[var(--padding-container)] inset-y-0 hidden bg-bg-sf2 tb:block" />
            <div>
                {distilleryQuery.isLoading ? (
                    <ListCardSkeleton
                        type="distillery"
                        className="overflow-hidden"
                    />
                ) : (
                    <ListCardData
                        type="distillery"
                        lists={distilleryQuery.data}
                        title="Top Distilleries"
                        isRevert
                        className="relative overflow-hidden tb:-mx-[var(--padding-container)] tb:px-[var(--padding-container)] tb:pb-[3.375rem] tb:pt-8 tb:contain-paint mb:pb-8 [&_*[data-dot-active='true']]:!bg-bd-inverse [&_*[data-dot='true']]:bg-bd-surface"
                        href={ROUTE_PUBLIC.DISTILLERY}
                        opts={{
                            loop: true,
                            align: "start",
                        }}
                        pagination
                    />
                )}
            </div>
        </div>
    );
};

export default PopularDistilleries;
