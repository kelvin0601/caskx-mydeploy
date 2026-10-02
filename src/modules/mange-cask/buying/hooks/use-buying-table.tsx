import CaskInfoCell from "@/components/shared/cask-info-cell";
import IconEdit from "@/components/shared/icons/icon-edit";
import IconEye from "@/components/shared/icons/icon-eye";
import IconNavArrow from "@/components/shared/icons/icon-nav-arrow";
import IconToggle from "@/components/shared/icons/icon-select-vlt";
import IconTrash from "@/components/shared/icons/icon-trash";
import ItemLabelWithIcon from "@/components/shared/label-w-ic";
import { RowActionsDropdown } from "@/components/shared/row-actions-dropdown";
import { Badge, TBadgeVariant } from "@/components/ui/badge";
import { ETransactionStatus } from "@/enum/transaction";
import { renderCellFromMapping } from "@/helpers/";
import { KEY_BID, MAPPING_COLOR_STATUS, ROUTE_PUBLIC } from "@/lib/constants";
import {
    formatCurrency,
    formatDateTime,
    handleRenderFallbackText,
} from "@/lib/utils";
import { useManageCask } from "@/modules/mange-cask/provider";
import { useMarketOrderManagement } from "@/modules/market-orders/management/provider";
import { MARKET_ORDER_KIND } from "@/modules/market-orders/constants";
import { caskBidService } from "@/services/cask-bid";
import { TTableConfig, TTableRow } from "@/types";
import { transaction } from "@/types/transaction";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export type TBuyingAction = {
    label: string;
    onClick: () => void;
    icon: ReactNode;
    buttonLabel: string;
    buttonVariant: "secondary" | "outline" | "ghost";
    buttonClassName?: string;
    onPrefetch?: () => void;
    isLoading?: boolean;
};

const getTransactionsQueryOptions = (bidId: string) => ({
    queryKey: [KEY_BID.BID_TRANSACTIONS, bidId] as const,
    queryFn: () => caskBidService.getTransactionsFormBidId({ bidId }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
});

export const useManageBuyingTable = () => {
    // Mapping content configuration
    const {
        setIsOpenDialog,
        setDialogData,
        setDialogType,
        setSortBy,
        setOrder,
        sortBy,
        order,
    } = useManageCask();
    const { openUpdate, openCancel } = useMarketOrderManagement();
    const queryClient = useQueryClient();
    const router = useRouter();
    const [transactionsCache, setTransactionsCache] = useState<
        Record<string, transaction.TTransaction[]>
    >({});

    const fetchTransactions = useCallback(
        async (bidId: string) => {
            return queryClient.fetchQuery(getTransactionsQueryOptions(bidId));
        },
        [queryClient]
    );

    const handleRemoveTransaction = useCallback(
        (row: TTableRow) => openCancel(row, MARKET_ORDER_KIND.OFFER),
        [openCancel]
    );

    const handleUpdateTransaction = useCallback(
        (row: TTableRow) => {
            if (!row.bidPrice) {
                toast.error("Bid price not found");
                return;
            }
            openUpdate(row, MARKET_ORDER_KIND.OFFER);
        },
        [openUpdate]
    );

    const handleViewCask = useCallback((row: TTableRow) => {
        window.open(
            `${ROUTE_PUBLIC.CASK_DETAILS}/${row.cask?.id || row.caskId}`,
            "_blank"
        );
    }, []);

    const handleGetTransactions = useCallback(
        async (row: TTableRow) => {
            if (transactionsCache[row.id]?.length) {
                return transactionsCache[row.id];
            }
            try {
                const data = await fetchTransactions(row.id);
                const transactions = data.data
                    .transactions as unknown as transaction.TTransaction[];
                setTransactionsCache((prev) => ({
                    ...prev,
                    [row.id]: transactions,
                }));
                return transactions;
            } catch (error) {
                console.error("Failed to get transactions", error);
                toast.error("Failed to load transactions");
            }
        },
        [fetchTransactions, transactionsCache]
    );

    const handleViewTransactions = useCallback(
        async (row: TTableRow) => {
            const transactions =
                transactionsCache[row.id] ?? (await handleGetTransactions(row));

            if (transactions?.length) {
                setIsOpenDialog(true);
                setDialogType("view_transaction");
                setDialogData({
                    ...row,
                    type: "bid",
                    transactions: transactions.map((transaction) => ({
                        ...transaction,
                        status:
                            transaction?.bid?.status ||
                            transaction?.status ||
                            transaction?.payoutStatus,
                        // with buyer will return transactionId
                        transactionId: transaction.transactionId,
                    })),
                });
            }
        },
        [
            handleGetTransactions,
            setDialogData,
            setDialogType,
            setIsOpenDialog,
            transactionsCache,
        ]
    );

    const handleViewDetail = useCallback(
        (row: TTableRow) => {
            router.push(`${ROUTE_PUBLIC.OFFER_DETAIL}/${row.id}`);
        },
        [router]
    );
    const renderAction = useCallback(
        (row: TTableRow): TBuyingAction[] | null => {
            switch (row.status) {
                case ETransactionStatus.ACTIVE: {
                    return [
                        {
                            label: "View detail",
                            buttonLabel: "View detail",
                            buttonVariant: "secondary",
                            buttonClassName: "px-5",
                            onClick: () => handleViewDetail(row),
                            icon: <IconEye />,
                        },
                        {
                            label: "Update bid",
                            buttonLabel: "Update",
                            buttonVariant: "outline",
                            buttonClassName: "px-5",
                            onClick: () => handleUpdateTransaction(row),
                            icon: <IconEdit />,
                        },
                        {
                            label: "Cancel bid",
                            buttonLabel: "Cancel",
                            buttonVariant: "ghost",
                            onClick: () => handleRemoveTransaction(row),
                            icon: <IconTrash />,
                        },
                    ];
                }
                case ETransactionStatus.COMPLETED:
                    return [
                        {
                            label: "View detail",
                            buttonLabel: "View detail",
                            buttonVariant: "secondary",
                            buttonClassName: "px-5",
                            onClick: () => handleViewDetail(row),
                            icon: <IconEye />,
                        },
                        {
                            label: "View cask",
                            buttonLabel: "View cask",
                            buttonVariant: "outline",
                            buttonClassName: "px-5",
                            onClick: () => handleViewCask(row),
                            icon: <IconNavArrow />,
                        },
                    ];
                default:
                    return null;
            }
        },
        [
            handleViewDetail,
            handleUpdateTransaction,
            handleRemoveTransaction,
            handleViewCask,
        ]
    );

    const MAPPING_CONTENT = {
        caskId: {
            render: (row: TTableRow) => (
                <CaskInfoCell
                    caskId={row.cask?.id || row.caskId}
                    caskName={
                        row?.master?.name
                            ? ` ${row?.master?.name} - ${row?.caskName ?? row?.cask?.name} `
                            : row?.caskName
                    }
                    distilleryName={row.distilleryName}
                    imageSrc={row?.master?.imageUrl}
                    imageAlt={row.caskName}
                    copyTimeout={1000}
                />
            ),
        },
        quantity: {
            render: (row: TTableRow) => (
                <div className="text-typo-body text-sm">
                    {handleRenderFallbackText(
                        (row.quantity - row.remainingQuantity).toString()
                    )}
                    /{handleRenderFallbackText(row.quantity.toString())}
                </div>
            ),
        },
        price: {
            render: (row: TTableRow) => {
                return (
                    <div className="flex flex-row items-center gap-2">
                        <div className="text-typo-body text-sm">
                            {formatCurrency(
                                row.price ?? row.bidPrice ?? row.askPrice ?? 0
                            )}
                        </div>
                        {row.isHighest && (
                            <Badge variant="success">Highest</Badge>
                        )}
                    </div>
                );
            },
        },
        total: {
            render: (row: TTableRow) => (
                <div className="text-typo-body text-sm">
                    {formatCurrency(row.total ?? row.subtotal ?? 0)}
                </div>
            ),
        },
        bidType: {
            render: (row: TTableRow) => (
                <div className="text-typo-body text-sm capitalize">
                    {handleRenderFallbackText(
                        row?.executionPolicy?.split("_").join(" ") ||
                            row?.bidType ||
                            ""
                    )}
                </div>
            ),
        },
        status: {
            render: (row: TTableRow) =>
                row.status && (
                    <Badge
                        dot-color={row?.status?.toLowerCase()}
                        variant={
                            MAPPING_COLOR_STATUS[row.status] as TBadgeVariant
                        }
                    >
                        {row?.status?.split("_").join(" ")}
                    </Badge>
                ),
        },
        expiredAt: {
            render: (row: TTableRow) => (
                <div className="text-typo-body whitespace-nowrap text-sm">
                    {formatDateTime(row.expirationDate || "").daysTime}
                </div>
            ),
        },
        action: {
            render: (row: TTableRow) =>
                (() => {
                    const actions = renderAction(row);
                    if (!actions) return null;

                    return (
                        <div className="flex h-full flex-row justify-end gap-0.5 py-4">
                            <RowActionsDropdown items={actions} />
                        </div>
                    );
                })(),
        },
    };

    const handleSort = useCallback(
        (
            field:
                | "unitPrice"
                | "status"
                | "quantity"
                | "type"
                | "subtotal"
                | "expirationDate"
        ) => {
            let nextOrder: "asc" | "desc" = "desc";
            if (sortBy !== field) {
                nextOrder = "desc";
            } else {
                nextOrder = order === "desc" ? "asc" : "desc";
            }

            const isGoingNone = sortBy === field && order === "asc";
            if (isGoingNone) {
                setSortBy("");
            } else {
                setSortBy(field);
            }
            setOrder(nextOrder);
        },
        [order, sortBy, setOrder, setSortBy]
    );

    // Function to get cell renderer for a specific field
    const renderCell = (key: string, row: TTableRow) =>
        renderCellFromMapping<TTableRow>(MAPPING_CONTENT, key, row);
    // Table configuration
    const TABLE_CONFIG: TTableConfig = useMemo(() => {
        return {
            columns: [
                {
                    key: "caskId",
                    label: () => {
                        return <ItemLabelWithIcon label="Bid" />;
                    },
                },
                {
                    key: "quantity",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Quantity"
                                isActive={sortBy === "quantity"}
                                icon={<IconToggle />}
                                order={sortBy === "quantity" ? order : "none"}
                                onClick={() => handleSort("quantity")}
                            />
                        );
                    },
                },
                {
                    key: "price",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Current Bid Price"
                                isActive={sortBy === "unitPrice"}
                                onClick={() => handleSort("unitPrice")}
                                icon={<IconToggle />}
                                order={sortBy === "unitPrice" ? order : "none"}
                            />
                        );
                    },
                },
                {
                    key: "total",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Subtotal"
                                isActive={sortBy === "subtotal"}
                                onClick={() => handleSort("subtotal")}
                                icon={<IconToggle />}
                                order={sortBy === "subtotal" ? order : "none"}
                            />
                        );
                    },
                },
                {
                    key: "bidType",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Bid Type"
                                isActive={sortBy === "type"}
                                onClick={() => handleSort("type")}
                                icon={<IconToggle />}
                                order={sortBy === "type" ? order : "none"}
                            />
                        );
                    },
                },
                {
                    key: "status",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Status"
                                isActive={sortBy === "status"}
                                onClick={() => handleSort("status")}
                                icon={<IconToggle />}
                                order={sortBy === "status" ? order : "none"}
                            />
                        );
                    },
                },
                {
                    key: "expiredAt",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Expired At"
                                icon={<IconToggle />}
                                isActive={sortBy === "expirationDate"}
                                order={
                                    sortBy === "expirationDate" ? order : "none"
                                }
                                onClick={() => handleSort("expirationDate")}
                            />
                        );
                    },
                },
                {
                    key: "action",
                    label: () => <></>,
                },
            ],
            gridCols:
                "grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1.1fr_0.7fr] group/table-row",
        };
    }, [sortBy, order, handleSort]);

    return {
        MAPPING_CONTENT,
        renderCell,
        TABLE_CONFIG,
        handleRemoveTransaction,
        handleUpdateTransaction,
        handleViewTransactions,
        handleViewCask,
        renderAction,
    };
};
