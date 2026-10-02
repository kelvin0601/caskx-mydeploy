import { ETransactionStatus } from "@/enum/transaction";
import { KEY_ASK, KEY_BID, KEY_TRANSACTIONS } from "@/lib/constants";
import { getTransactionStatusLabelWithFallback } from "@/lib/constants/transaction-status";
import caskAskService from "@/services/cask-ask";
import { caskBidService } from "@/services/cask-bid";
import { caskTransactionsService } from "@/services/cask-transactions";
import { caskAsk } from "@/types/cask-ask";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useInvalidateCaskCache } from "./useInvalidateCaskCache";
import { useManageCask } from "../modules/mange-cask/provider";

type StatusCount = {
    status: string;
    count: number;
    step?: string;
};

type StatusHeaderItem = {
    label: string;
    value: string;
    count: number;
};

type StatusHeader = {
    all: StatusHeaderItem;
    [key: string]: StatusHeaderItem;
};

type DataHeader = Record<
    string,
    {
        label: string;
        value: string;
        count: number;
    }
>;

export function useAskStatusCounts() {
    return useQuery({
        queryKey: [KEY_ASK.ASK_STATUS_COUNT],
        queryFn: () => caskAskService.getStatusCountAsks(),
        placeholderData: keepPreviousData,
    });
}

export function useTransactionStatusCounts() {
    const onGoingStatusCountsQuery = useQuery({
        queryKey: [KEY_TRANSACTIONS.ONGOING_TRANSACTIONS],
        queryFn: () =>
            caskTransactionsService.getTransactionOnGoingStatusCounts(),
        placeholderData: keepPreviousData,
    });

    const statusHeader = useMemo(() => {
        if (!onGoingStatusCountsQuery?.data?.data) {
            return {
                all: {
                    label: "All",
                    value: "",
                    count: 0,
                },
            } as StatusHeader;
        }

        let totalCount = 0;
        const dataHeading = onGoingStatusCountsQuery.data.data.reduce(
            (acc: Record<string, StatusHeaderItem>, current: StatusCount) => {
                totalCount += current.count;
                if (current.step) {
                    return {
                        ...acc,
                        [current.step]: {
                            label: getTransactionStatusLabelWithFallback(
                                current.step
                            ),
                            value: current.step,
                            count: current.count,
                        },
                    };
                }
                return acc;
            },
            {}
        );

        return {
            all: {
                label: "All",
                value: " ",
                count: totalCount,
            },
            ...dataHeading,
        } as StatusHeader;
    }, [onGoingStatusCountsQuery?.data?.data]);
    const isEmptyHeadingCount = onGoingStatusCountsQuery?.data?.data?.every(
        (item: StatusCount) => item.count === 0
    );
    return {
        statusHeader,
        isEmptyHeadingCount,
        isLoading: onGoingStatusCountsQuery.isLoading,
        isError: onGoingStatusCountsQuery.isError,
        data: onGoingStatusCountsQuery.data,
    };
}

export function useTransactionHistoryStatusCounts() {
    const historyStatusCountsQuery = useQuery({
        queryKey: [KEY_TRANSACTIONS.HISTORY_TRANSACTIONS],
        queryFn: () => caskTransactionsService.getTransactionHistoryStatus(),
        placeholderData: keepPreviousData,
    });

    const statusHeader = useMemo(() => {
        if (!historyStatusCountsQuery?.data?.data) {
            return {
                all: {
                    label: "All",
                    value: "",
                    count: 0,
                },
            } as StatusHeader;
        }

        let totalCount = 0;
        const dataHeading = historyStatusCountsQuery.data.data.reduce(
            (acc: Record<string, StatusHeaderItem>, current: StatusCount) => {
                totalCount += current.count;
                if (current.step) {
                    return {
                        ...acc,
                        [current.step]: {
                            label: getTransactionStatusLabelWithFallback(
                                current.step
                            ),
                            value: current.step,
                            count: current.count,
                        },
                    };
                }
                return acc;
            },
            {}
        );

        return {
            all: {
                label: "All",
                value: "",
                count: totalCount,
            },
            ...dataHeading,
        } as StatusHeader;
    }, [historyStatusCountsQuery?.data?.data]);

    const isEmptyHeadingCount = historyStatusCountsQuery?.data?.data?.every(
        (item: StatusCount) => item.count === 0
    );

    return {
        statusHeader,
        isEmptyHeadingCount,
        isLoading: historyStatusCountsQuery.isLoading,
        isError: historyStatusCountsQuery.isError,
        data: historyStatusCountsQuery.data,
    };
}

export function useTransactionSellingStatusCounts() {
    const { status, page, limit, sortBy, order, search, resetFilters } =
        useManageCask();
    const getStatusCountAsksQuery = useAskStatusCounts();

    useEffect(() => {
        resetFilters();
    }, [resetFilters]);

    const filters = useMemo(
        () => ({
            status,
            page,
            limit,
            size: limit,
            sortBy,
            order,
            search,
        }),
        [status, page, limit, sortBy, order, search]
    );

    const getMyAsksQuery = useQuery({
        queryKey: [KEY_ASK.ASK_MY_ASKS, filters],
        queryFn: async () => {
            try {
                const result = await caskAskService.getMyAsks(
                    filters as Partial<caskAsk.TOrderListFilters>
                );
                return (
                    result || {
                        data: [],
                        total: 0,
                        totalPages: 0,
                    }
                );
            } catch (error) {
                const err = error as Error & { code?: string };
                if (
                    err?.message === "canceled" ||
                    err?.name === "CanceledError" ||
                    err?.code === "ERR_CANCELED"
                ) {
                    throw error;
                }
                console.error("Error fetching my asks:", error);
                return {
                    data: [],
                    total: 0,
                    totalPages: 0,
                };
            }
        },
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000,
    });

    const dataHeaderOrdered = useMemo(() => {
        const data = getStatusCountAsksQuery?.data;
        if (!data) return {};

        const orderKeys = Object.values(ETransactionStatus);
        const ordered: DataHeader = {};
        const total = orderKeys.reduce((sum, key) => {
            const count = data[key.toLowerCase() as keyof typeof data];
            return typeof count === "number" ? sum + count : sum;
        }, 0);

        ordered.all = {
            label: "All",
            value: "",
            count: total,
        };

        for (const key of orderKeys) {
            const lc = key.toLowerCase();
            const count = data[lc as keyof typeof data];
            if (typeof count === "number" && lc !== "pending") {
                ordered[lc] = {
                    label: key.charAt(0).toUpperCase() + key.slice(1),
                    value: lc,
                    count,
                };
            }
        }

        return ordered;
    }, [getStatusCountAsksQuery?.data]);

    const isEmptyHeadingCount = useMemo(() => {
        if (!getStatusCountAsksQuery?.data) return true;
        return Object.values(getStatusCountAsksQuery.data).every(
            (count) => typeof count === "number" && count === 0
        );
    }, [getStatusCountAsksQuery?.data]);

    return {
        getMyAsksQuery,
        dataHeaderOrdered,
        isEmptyHeadingCount,
    };
}

export function useTransactionBuyingStatusCounts() {
    const { status, page, limit, sortBy, order, search, resetFilters } =
        useManageCask();
    const { invalidateManageBids } = useInvalidateCaskCache();

    useEffect(() => {
        resetFilters();
    }, [resetFilters]);

    useEffect(() => {
        invalidateManageBids();
    }, [invalidateManageBids]);

    const filters = useMemo(
        () => ({
            status,
            page,
            limit,
            size: limit,
            sortBy,
            order,
            search,
        }),
        [status, page, limit, sortBy, order, search]
    );

    const getStatusCountBidsQuery = useQuery({
        queryKey: [KEY_BID.BID_MY_BIDS, KEY_BID.BID_LIST],
        queryFn: caskBidService.getStatusCountBids,
    });

    const getMyBidsQuery = useQuery({
        queryKey: [KEY_BID.BID_MY_BIDS, filters],
        queryFn: async () => {
            try {
                const result = await caskBidService.getMyBids(
                    filters as Partial<caskAsk.TOrderListFilters>
                );
                return (
                    result || {
                        data: [],
                        total: 0,
                        totalPages: 0,
                    }
                );
            } catch (error) {
                const err = error as Error & { code?: string };
                if (
                    err?.message === "canceled" ||
                    err?.name === "CanceledError" ||
                    err?.code === "ERR_CANCELED"
                ) {
                    throw error;
                }
                console.error("Error fetching my bids:", error);
                return {
                    data: [],
                    total: 0,
                    totalPages: 0,
                };
            }
        },
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000,
    });

    const dataHeaderOrdered = useMemo(() => {
        const data = getStatusCountBidsQuery?.data;
        const orderKeys = Object.values(ETransactionStatus);
        const ordered: DataHeader = {};
        const total = orderKeys.reduce((sum, key) => {
            const lc = key.toLowerCase() as keyof typeof data;
            const count = data?.[lc];
            return typeof count === "number" ? sum + count : sum;
        }, 0);

        ordered.all = {
            label: "All",
            value: "",
            count: total,
        };

        for (const key of orderKeys) {
            const lc = key.toLowerCase() as keyof typeof data;
            const count = data?.[lc];
            if (typeof count === "number") {
                ordered[lc as string] = {
                    label: key.charAt(0).toUpperCase() + key.slice(1),
                    value: lc as string,
                    count,
                };
            }
        }

        return ordered;
    }, [getStatusCountBidsQuery?.data]);

    const isEmptyHeadingCount = useMemo(() => {
        if (!getStatusCountBidsQuery?.data) return true;
        return Object.values(getStatusCountBidsQuery.data).every(
            (count) => typeof count === "number" && count === 0
        );
    }, [getStatusCountBidsQuery?.data]);

    return {
        getMyBidsQuery,
        dataHeaderOrdered,
        isEmptyHeadingCount,
    };
}
