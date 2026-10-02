import CaskInfoCell from "@/components/shared/cask-info-cell";
import IconEdit from "@/components/shared/icons/icon-edit";
import IconEye from "@/components/shared/icons/icon-eye";
import IconFile from "@/components/shared/icons/icon-file";
import IconNavArrow from "@/components/shared/icons/icon-nav-arrow";
import IconToggle from "@/components/shared/icons/icon-select-vlt";
import IconTrash from "@/components/shared/icons/icon-trash";
import { RowActionsDropdown } from "@/components/shared/row-actions-dropdown";
import ItemLabelWithIcon from "@/components/shared/label-w-ic";
import CustomTooltip, {
    TCustomTooltipRef,
} from "@/components/shared/tooltips-custom";
import { Badge, TBadgeVariant } from "@/components/ui/badge";
import { ETransactionStatus } from "@/enum/transaction";
import { renderCellFromMapping } from "@/helpers";
import {
    KEY_TRANSACTIONS,
    MAPPING_COLOR_STATUS,
    ROUTE_PUBLIC,
} from "@/lib/constants";
import {
    formatCurrency,
    formatDateTime,
    handleRenderFallbackText,
} from "@/lib/utils";
import { useManageCask } from "@/modules/mange-cask/provider";
import { useMarketOrderManagement } from "@/modules/market-orders/management/provider";
import { MARKET_ORDER_KIND } from "@/modules/market-orders/constants";
import caskTransactionsService from "@/services/cask-transactions";
import { TTableConfig, TTableRow } from "@/types";
import { transaction } from "@/types/transaction";
import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type TActionItem = {
    label: string;
    onClick: () => void;
    icon: ReactNode;
};

export const useManageSellingTable = () => {
    const [transactionsCache, setTransactionsCache] = useState<
        Partial<Record<string, transaction.TTransaction[]>>
    >({});

    // Mapping content configuration
    const {
        setIsOpenDialog,
        setDialogType,
        setDialogData,
        setSortBy,
        setOrder,
        sortBy,
        order,
    } = useManageCask();
    const { openUpdate, openCancel } = useMarketOrderManagement();
    const queryClient = useQueryClient();

    const fetchTransactions = useCallback(
        async (askId: string) => {
            return queryClient.fetchQuery({
                queryKey: [KEY_TRANSACTIONS.ASKS, askId],
                queryFn: () =>
                    caskTransactionsService.getTransactionPayout({ askId }),
                staleTime: 1000 * 60 * 5,
            });
        },
        [queryClient]
    );

    const handleGetTransactions = useCallback(
        async (row: TTableRow) => {
            if (transactionsCache[row.id]?.length) {
                return transactionsCache[row.id];
            }
            try {
                const data = await fetchTransactions(row.id);
                const transactions =
                    data.transactions as transaction.TTransaction[];
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

    const handleRemoveTransaction = useCallback(
        (row: TTableRow) => {
            openCancel(row, MARKET_ORDER_KIND.LISTING);
        },
        [openCancel]
    );

    const handleUpdateTransaction = useCallback(
        (row: TTableRow) => {
            if (!row.askPrice) {
                toast.error("Ask price not found");
                return;
            }
            openUpdate(row, MARKET_ORDER_KIND.LISTING);
        },
        [openUpdate]
    );

    const handleViewCask = useCallback((row: TTableRow) => {
        window.open(`${ROUTE_PUBLIC.CASK_DETAILS}/${row.caskId}`, "_blank");
    }, []);

    const handleViewTransactions = useCallback(async (row: TTableRow) => {
        window.open(`${ROUTE_PUBLIC.PAYOUT}/${row.id}`, "_blank");

        /**
         * Ignore this for now
         */
        // let transactions = transactionsCache[row.id];
        // if (!transactions) {
        //     transactions = await handleGetTransactions(row);
        // }

        // if (!transactions || transactions.length === 0) {
        //     toast.error("No transactions found");
        //     return;
        // }

        // setIsOpenDialog(true);
        // setDialogType("view_transaction");
        // setDialogData({
        //     ...row,
        //     type: "ask",
        //     transactions: transactions.map((transaction) => ({
        //         ...transaction,
        //         status:
        //             transaction?.ask?.status || transaction?.payoutStatus,
        //         // with seller will return  id
        //         transactionId: transaction.id,
        //     })),
        // });
    }, []);

    const renderAction = useCallback(
        (row: TTableRow): TActionItem[] | null => {
            switch (row.status) {
                case ETransactionStatus.ACTIVE:
                    return [
                        transactionsCache[row.id]?.length && {
                            label: "View transactions",
                            onClick: () => handleViewTransactions(row),
                            icon: <IconEye />,
                        },
                        {
                            label: "Update ask",
                            onClick: () => handleUpdateTransaction(row),
                            icon: <IconEdit />,
                        },
                        {
                            label: "Cancel ask",
                            onClick: () => handleRemoveTransaction(row),
                            icon: <IconTrash />,
                        },
                    ].filter(Boolean) as TActionItem[];

                case ETransactionStatus.PENDING:
                    return [
                        {
                            label: "Sign release form",
                            onClick: () => handleViewTransactions(row),
                            icon: <IconFile />,
                        },
                        {
                            label: "Update ask",
                            onClick: () => handleUpdateTransaction(row),
                            icon: <IconEdit />,
                        },
                        {
                            label: "Cancel ask",
                            onClick: () => handleRemoveTransaction(row),
                            icon: <IconTrash />,
                        },
                    ];

                case ETransactionStatus.COMPLETED:
                    return [
                        {
                            label: "View transactions",
                            onClick: () => handleViewTransactions(row),
                            icon: <IconEye />,
                        },
                        {
                            label: "View Cask",
                            onClick: () => handleViewCask(row),
                            icon: <IconNavArrow />,
                        },
                    ];
                default:
                    return null;
            }
        },
        [
            handleRemoveTransaction,
            handleUpdateTransaction,
            handleViewCask,
            handleViewTransactions,
            transactionsCache,
        ]
    );

    const handleSort = useCallback(
        (
            field:
                | "unitPrice"
                | "status"
                | "quantity"
                | "type"
                | "subtotal"
                | "expirationDate"
                | "totalPaid"
        ) => {
            let nextOrder: "asc" | "desc" = "desc";
            if (sortBy !== field) {
                nextOrder = "desc";
            } else {
                nextOrder = order === "desc" ? "asc" : "desc";
            }

            // Cycle: desc -> asc -> none (none = sortBy = "")
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

    const MAPPING_CONTENT = {
        Ask: {
            render: (row: TTableRow) => (
                <CaskInfoCell
                    caskId={row?.master?.id}
                    caskName={
                        row?.master?.name
                            ? ` ${row?.master?.name} - ${row?.caskName ?? row?.cask?.name}`
                            : row?.caskName
                    }
                    distilleryName={row.distilleryName}
                    imageSrc={
                        row?.cask?.imageUrl || row?.caskImage || row?.imageSrc
                    }
                    imageAlt={row?.caskName}
                    copyTimeout={2000}
                />
            ),
        },
        quantity: {
            render: (row: TTableRow) => (
                <div className="text-sm text-typo-soft">
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
                        <div className="text-sm text-typo-soft">
                            {formatCurrency(
                                row.price ?? row.askPrice ?? row.bidPrice ?? 0
                            )}
                        </div>
                        {row?.isLowest && (
                            <Badge variant="success">Lowest</Badge>
                        )}
                    </div>
                );
            },
        },
        total: {
            render: (row: TTableRow) => (
                <div className="text-sm text-typo-soft">
                    {formatCurrency(row.total ?? row.subtotal ?? 0)}
                </div>
            ),
        },
        totalPaid: {
            render: (row: TTableRow) => (
                <div className="text-sm text-typo-soft">
                    {formatCurrency(row.totalPaid)}
                </div>
            ),
        },
        askType: {
            render: (row: TTableRow) => (
                <div className="text-sm capitalize text-typo-soft">
                    {handleRenderFallbackText(
                        row?.executionPolicy.split("_").join(" ")
                    )}
                </div>
            ),
        },
        status: {
            render: (row: TTableRow) =>
                row.status && (
                    <Badge
                        dot-color={row.status?.toLowerCase()}
                        variant={
                            MAPPING_COLOR_STATUS[row.status] as TBadgeVariant
                        }
                    >
                        {row?.status.split("_").join(" ")}
                    </Badge>
                ),
        },
        expiredAt: {
            render: (row: TTableRow) => (
                <div className="whitespace-nowrap text-sm text-typo-soft">
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
                        <div
                            className="flex h-full flex-row justify-end gap-0.5 py-4"
                            onMouseEnter={() => {
                                handleGetTransactions(row);
                            }}
                        >
                            <RowActionsDropdown items={actions} />
                        </div>
                    );
                })(),
        },
    };

    // Function to get cell renderer for a specific field
    const renderCell = (key: string, row: TTableRow) =>
        renderCellFromMapping<typeof row>(MAPPING_CONTENT, key, row);
    // Table configuration
    const TABLE_CONFIG: TTableConfig = useMemo(() => {
        return {
            columns: [
                {
                    key: "Ask",
                    label: () => {
                        return <ItemLabelWithIcon label="Ask" />;
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
                                label="Current Ask Price"
                                isActive={sortBy === "unitPrice"}
                                icon={<IconToggle />}
                                order={sortBy === "unitPrice" ? order : "none"}
                                onClick={() => handleSort("unitPrice")}
                            />
                        );
                    },
                },
                {
                    key: "total",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Total Value"
                                icon={<IconToggle />}
                                isActive={sortBy === "subtotal"}
                                order={sortBy === "subtotal" ? order : "none"}
                                onClick={() => handleSort("subtotal")}
                            />
                        );
                    },
                },
                {
                    key: "totalPaid",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Total Paid"
                                icon={<IconToggle />}
                                isActive={sortBy === "totalPaid"}
                                order={sortBy === "totalPaid" ? order : "none"}
                                onClick={() => handleSort("totalPaid")}
                            />
                        );
                    },
                },
                {
                    key: "askType",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Ask Type"
                                icon={<IconToggle />}
                                isActive={sortBy === "type"}
                                order={sortBy === "type" ? order : "none"}
                                onClick={() => handleSort("type")}
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
                                icon={<IconToggle />}
                                isActive={sortBy === "status"}
                                order={sortBy === "status" ? order : "none"}
                                onClick={() => handleSort("status")}
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
                "grid-cols-[1.8fr_0.9fr_1.5fr_1fr_1fr_1fr_1fr_1.3fr_0.5fr] group/table-row",
        };
    }, [sortBy, order, handleSort]);

    return {
        MAPPING_CONTENT,
        renderCell,
        TABLE_CONFIG,
        handleRemoveTransaction,
        handleUpdateTransaction,
    };
};
