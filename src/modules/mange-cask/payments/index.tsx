"use client";

import { useManageTransactionHistory } from "@/hooks/useManageTransactionHistory";
import { useManageTransactionOngoingTable } from "@/hooks/useManageTransactionOngoing";
import {
    useTransactionHistoryStatusCounts,
    useTransactionStatusCounts,
} from "@/hooks/useTransactionStatusCounts";
import { KEY_TRANSACTIONS } from "@/lib/constants";
import { isEmpty } from "@/lib/utils";
import { caskTransactionsService } from "@/services/cask-transactions";
import { TTableRow } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import BodyTable from "../body-table";
import BodyTableSkeleton from "../body-table/skeleton";
import EmptyData from "../empty-data";
import HeadingNav, { SubHeadingNav } from "../heading-nav";
import { ManageCask, useManageCask } from "../provider";

const PendingSection = () => {
    const { renderCell, TABLE_CONFIG } = useManageTransactionOngoingTable();
    const { page, limit, sortBy, order, search, step } = useManageCask();

    const filters = {
        page,
        limit,
        sortBy,
        sortOrder: order,
        // ...(status && { status }),
        ...(step && { step }),
        ...(search && { search }),
    } as const;

    const { statusHeader: pendingHeader, isEmptyHeadingCount } =
        useTransactionStatusCounts();

    const pendingQuery = useQuery({
        queryKey: [
            KEY_TRANSACTIONS.MY_TRANSACTIONS,
            "pending",
            { page, limit, sortBy, order, step, search },
        ],
        queryFn: () => caskTransactionsService.getOnGoingTransactions(filters),
        placeholderData: keepPreviousData,
    });

    if (pendingQuery.isLoading) {
        return (
            <div>
                <HeadingNav
                    subTitle="On-Going Transactions"
                    title="Buying Activity"
                    description="Track the progress of your cask purchases."
                >
                    <SubHeadingNav />
                </HeadingNav>
                <BodyTableSkeleton TABLE_CONFIG={TABLE_CONFIG} />
            </div>
        );
    }

    return (
        <div>
            <HeadingNav
                subTitle="On-Going Transactions"
                title="Buying Activity"
                description="Track the progress of your cask purchases."
            >
                <SubHeadingNav />
            </HeadingNav>
            <BodyTable
                contentError="transactions"
                data={
                    (pendingQuery?.data?.data as unknown as TTableRow[]) || []
                }
                dataHeader={pendingHeader}
                renderCell={
                    renderCell as unknown as (
                        key: string,
                        row: TTableRow
                    ) => React.ReactNode
                }
                TABLE_CONFIG={TABLE_CONFIG}
                totalPages={pendingQuery?.data?.pagination?.totalPages || 0}
                totalRecords={pendingQuery?.data?.pagination?.totalRecords || 0}
                currentCount={pendingQuery?.data?.data?.length || 0}
            />
        </div>
    );
};

const HistorySection = () => {
    const {
        renderCell: renderCellHistory,
        TABLE_CONFIG: TABLE_CONFIG_HISTORY,
    } = useManageTransactionHistory();
    const {
        page,
        limit,
        sortBy,
        order,
        status,
        search,
        dialogType,
        isOpenDialog,
    } = useManageCask();
    console.log("dialogType", dialogType, isOpenDialog);
    const filters = {
        page,
        limit,
        sortBy,
        sortOrder: order,
        ...(status && { status }),
    } as const;

    const { statusHeader: historyHeader, isEmptyHeadingCount } =
        useTransactionHistoryStatusCounts();

    const historyQuery = useQuery({
        queryKey: [
            KEY_TRANSACTIONS.MY_TRANSACTIONS,
            { page, limit, sortBy, order, status, search },
        ],
        queryFn: () => caskTransactionsService.getHistoryTransactions(filters),
        placeholderData: keepPreviousData,
    });

    if (historyQuery.isLoading) {
        return (
            <div>
                <HeadingNav
                    subTitle="Transactions History"
                    description="View a complete record of your past cask purchases."
                >
                    <SubHeadingNav />
                </HeadingNav>
                <BodyTableSkeleton TABLE_CONFIG={TABLE_CONFIG_HISTORY} />
            </div>
        );
    }

    return (
        <div>
            <HeadingNav
                subTitle="Transactions History"
                description="View a complete record of your past cask purchases."
            >
                <SubHeadingNav />
            </HeadingNav>
            <BodyTable
                contentError="transactions"
                data={
                    (historyQuery?.data
                        ?.data as unknown as import("@/types").TTableRow[]) ||
                    []
                }
                dataHeader={historyHeader}
                renderCell={
                    renderCellHistory as unknown as (
                        key: string,
                        row: import("@/types").TTableRow
                    ) => React.ReactNode
                }
                TABLE_CONFIG={TABLE_CONFIG_HISTORY}
                totalPages={historyQuery?.data?.pagination?.totalPages || 0}
                totalRecords={historyQuery?.data?.pagination?.totalRecords || 0}
                currentCount={historyQuery?.data?.data?.length || 0}
            />
        </div>
    );
};

const PaymentsModule = () => {
    // Independent providers so state/filters don't affect each other
    const { isEmptyHeadingCount: isEmptyHeadingCountPending } =
        useTransactionStatusCounts();
    const { isEmptyHeadingCount: isEmptyHeadingCountHistory } =
        useTransactionHistoryStatusCounts();
    if (isEmptyHeadingCountPending && isEmptyHeadingCountHistory)
        return (
            <div>
                <EmptyData
                    title="Awaiting Your Transactions"
                    className="my-[15vh]"
                    description=" You don't have on-going transactions. Casks that you are investing in will show up here."
                />
            </div>
        );
    return (
        <div className="flex flex-col gap-12">
            <PendingSection />
            <HistorySection />
        </div>
    );
};

export default PaymentsModule;
