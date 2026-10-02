"use client";

import PaginationBar from "@/components/shared/pagination-bar";
import { useDebounce } from "@/hooks/useDebounce";
import { SORT_DISTILLERIES } from "@/lib/constants";
import { CASK_KEYS, DISTILLERY_KEYS } from "@/lib/constants/key";
import { PARAMS } from "@/lib/constants/route";
import { getErrorMessage } from "@/lib/utils";
import caskServices from "@/services/cask";
import caskMasterServices from "@/services/cask-master";
import distilleriesServices from "@/services/distilleries";
import { useBoundStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import SearchActionBar from "./search-action-bar";
import SearchResultsGrid from "./search-results-grid";
import SearchResultsHeader from "./search-results-header";

type SearchTab = "cask" | "distillery";

type TSearchResultsModuleProps = {
    initialSearchQuery?: string;
};

const PAGE_SIZE = 8;

function parseSortValue(value: string) {
    const separatorIndex = value.lastIndexOf("_");
    if (separatorIndex <= 0) return null;

    return {
        sortBy: value.slice(0, separatorIndex),
        sortOrder: value.slice(separatorIndex + 1).toUpperCase(),
    };
}

function getListingParams(search: string, sortValue: string) {
    const params = new URLSearchParams({
        page: "1",
        size: "100",
    });

    if (search) params.set("search", search);

    const sort = parseSortValue(sortValue);
    if (sort) {
        params.set(PARAMS.sortBy, sort.sortBy);
        params.set(PARAMS.sortOrder, sort.sortOrder);
    }

    return params.toString();
}

function getSortValueFromUrl(searchParams: URLSearchParams) {
    const sortBy = searchParams.get(PARAMS.sortBy) || "";
    const sortOrder = searchParams.get(PARAMS.sortOrder) || "";

    if (sortBy.includes(`&${PARAMS.sortOrder}=`)) {
        const [field, order] = sortBy.split(`&${PARAMS.sortOrder}=`);
        return field && order ? `${field}_${order.toLowerCase()}` : "";
    }

    return sortBy && sortOrder ? `${sortBy}_${sortOrder.toLowerCase()}` : "";
}

export default function SearchResultsModule({
    initialSearchQuery = "",
}: TSearchResultsModuleProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const userId = useBoundStore((state) => state.user?.id);

    const urlQuery = searchParams.get("q") || searchParams.get("search") || "";

    const [activeTab, setActiveTab] = useState<SearchTab>("cask");
    const [searchQuery, setSearchQuery] = useState(
        urlQuery || initialSearchQuery
    );
    const [showOwnedOnly, setShowOwnedOnly] = useState(false);
    const [showBuyNow, setShowBuyNow] = useState(false);
    const [sortBy, setSortBy] = useState(() =>
        getSortValueFromUrl(new URLSearchParams(searchParams.toString()))
    );
    const [page, setPage] = useState(1);

    const debouncedSearchQuery = useDebounce(searchQuery.trim(), 300);
    const caskSortValue = activeTab === "cask" ? sortBy : "";
    const distillerySortValue = activeTab === "distillery" ? sortBy : "";

    const casksQuery = useQuery({
        queryKey: [
            CASK_KEYS.GET_CASK,
            "search-results",
            debouncedSearchQuery,
            caskSortValue,
        ],
        queryFn: () =>
            caskMasterServices.getCaskMastersListing(
                getListingParams(debouncedSearchQuery, caskSortValue)
            ),
        enabled: activeTab === "cask",
        staleTime: 60 * 1000,
    });

    const distilleriesQuery = useQuery({
        queryKey: [
            DISTILLERY_KEYS.LISTING,
            "search-results",
            debouncedSearchQuery,
            distillerySortValue,
        ],
        queryFn: () =>
            distilleriesServices.getDistilleriesListing(
                getListingParams(debouncedSearchQuery, distillerySortValue)
            ),
        enabled: activeTab === "distillery",
        staleTime: 60 * 1000,
    });

    const caskSortQuery = useQuery({
        queryKey: [CASK_KEYS.SORT_CASK],
        queryFn: caskServices.getSortedCasks,
        enabled: activeTab === "cask",
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        setSearchQuery(urlQuery);
    }, [urlQuery]);

    useEffect(() => {
        setSortBy(
            getSortValueFromUrl(new URLSearchParams(searchParams.toString()))
        );
    }, [searchParams]);

    useEffect(() => {
        const queryParams = new URLSearchParams(searchParams.toString());
        const currentUrlQuery =
            queryParams.get("q") || queryParams.get("search") || "";

        if (debouncedSearchQuery === currentUrlQuery) return;

        if (debouncedSearchQuery) {
            queryParams.set("q", debouncedSearchQuery);
        } else {
            queryParams.delete("q");
        }

        queryParams.delete("search");
        const nextQuery = queryParams.toString();

        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
            scroll: false,
        });
    }, [debouncedSearchQuery, pathname, router, searchParams]);

    useEffect(() => {
        setPage(1);
    }, [activeTab, debouncedSearchQuery, showOwnedOnly, showBuyNow, sortBy]);

    const filteredCasks = useMemo(() => {
        const results = (casksQuery.data?.data ?? []).filter((item) => {
            const isOwned = item.children?.some(
                (child) => child.ownerId === userId
            );

            if (showOwnedOnly && !isOwned) return false;
            if (showBuyNow && !(Number(item.lowestAsk) > 0)) return false;
            return true;
        });

        return results;
    }, [casksQuery.data, showBuyNow, showOwnedOnly, userId]);

    const filteredDistilleries = useMemo(() => {
        return distilleriesQuery.data?.data ?? [];
    }, [distilleriesQuery.data]);

    const caskCount = filteredCasks.length;
    const distilleryCount = filteredDistilleries.length;
    const totalRecords = activeTab === "cask" ? caskCount : distilleryCount;
    const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
    const startIndex = (page - 1) * PAGE_SIZE;
    const visibleCasks = filteredCasks.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );
    const visibleDistilleries = filteredDistilleries.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );
    const activeQuery = activeTab === "cask" ? casksQuery : distilleriesQuery;
    const sortOptions =
        activeTab === "cask"
            ? (caskSortQuery.data?.sortOptions ?? [])
            : SORT_DISTILLERIES;

    const handleSortChange = (value: string) => {
        setSortBy(value);
        setPage(1);

        const queryParams = new URLSearchParams(searchParams.toString());
        const sort = parseSortValue(value);

        if (sort) {
            queryParams.set(PARAMS.sortBy, sort.sortBy);
            queryParams.set(PARAMS.sortOrder, sort.sortOrder);
        } else {
            queryParams.delete(PARAMS.sortBy);
            queryParams.delete(PARAMS.sortOrder);
        }

        const nextQuery = queryParams.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
            scroll: false,
        });
    };

    const handleTabChange = (tab: SearchTab) => {
        setActiveTab(tab);
        handleSortChange("");
    };

    const handleClear = () => {
        setSearchQuery("");
        setShowOwnedOnly(false);
        setShowBuyNow(false);
        handleSortChange("");
        setPage(1);
    };

    return (
        <section className="min-h-[50rem] bg-bg-main">
            <div className="container mx-auto">
                <SearchResultsHeader
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    caskCount={caskCount}
                    distilleryCount={distilleryCount}
                />

                <SearchActionBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    showOwnedOnly={showOwnedOnly}
                    onToggleOwned={setShowOwnedOnly}
                    showBuyNow={showBuyNow}
                    onToggleBuyNow={setShowBuyNow}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    sortOptions={sortOptions}
                    sortPlaceholder={
                        activeTab === "cask"
                            ? "Popular Cask"
                            : "Number of ratings (Decreasing)"
                    }
                    showToggles={activeTab === "cask"}
                    placeholder={
                        activeTab === "cask"
                            ? "Search by cask name"
                            : "Search by distillery name"
                    }
                />

                {activeQuery.isError ? (
                    <div
                        className="my-8 border border-error bg-error/10 p-4 text-sm text-error"
                        role="alert"
                    >
                        {getErrorMessage(
                            activeQuery.error,
                            `Unable to load ${activeTab === "cask" ? "casks" : "distilleries"}. Please try again.`
                        )}
                    </div>
                ) : (
                    <SearchResultsGrid
                        activeTab={activeTab}
                        casks={visibleCasks}
                        distilleries={visibleDistilleries}
                        isLoading={activeQuery.isFetching}
                        onClear={handleClear}
                    />
                )}

                {totalPages > 1 ? (
                    <PaginationBar
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        pageParams={page}
                        sizeParams={PAGE_SIZE}
                        totalRecords={totalRecords}
                        currentCount={
                            activeTab === "cask"
                                ? visibleCasks.length
                                : visibleDistilleries.length
                        }
                        className="mb-10 tb:mb-5 mb:mb-4"
                        size={PAGE_SIZE}
                        keyRefetch="search-results"
                        changeParams=""
                    />
                ) : null}
            </div>
        </section>
    );
}
