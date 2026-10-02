import CaskInfoCell from "@/components/shared/cask-info-cell";
import IconDownload from "@/components/shared/icons/icon-download";
import IconToggle from "@/components/shared/icons/icon-select-vlt";
import ItemLabelWithIcon from "@/components/shared/label-w-ic";
import CustomTooltip from "@/components/shared/tooltips-custom";
import { Badge, TBadgeVariant } from "@/components/ui/badge";
import { renderCellFromMapping } from "@/helpers";
import { MAPPING_COLOR_STATUS, ROUTE_PUBLIC } from "@/lib/constants";
import {
    formatCurrency,
    formatDateTime,
    handleRenderFallbackText,
} from "@/lib/utils";
import { TSortBy, useManageCask } from "@/modules/mange-cask/provider";
import { cask, TTableConfig, TTableRow } from "@/types";
import { useCallback, useMemo, useState } from "react";

type TManageTransactionHistoryTableRow = TTableRow & {
    cask: cask.TCask & { distilleryName: string };
    distilleryName: string;
    totalPrice: number;
    paymentSessionId: string;
    purchaseDate: string;
};

export const useManageTransactionHistory = () => {
    const {
        setDialogData,
        setDialogType,
        setIsOpenDialog,
        setOrder,
        setSortBy,
        order,
        dialogType,
        sortBy,
    } = useManageCask();
    const handleDownloadDocuments = (
        row: TManageTransactionHistoryTableRow
    ) => {
        console.log("row", row);
        setIsOpenDialog(true);
        setDialogType("download_documents");
        setDialogData(row);
    };

    const MAPPING_CONTENT = {
        caskId: {
            render: (row: TManageTransactionHistoryTableRow) => {
                return (
                    <CaskInfoCell
                        caskId={row.master?.id}
                        caskName={
                            row?.master?.name
                                ? ` ${row?.master?.name} - ${row?.cask?.name}`
                                : row?.caskName
                        }
                        distilleryName={row?.cask?.distilleryName}
                        imageSrc={row.cask?.image}
                        imageAlt={row?.cask?.name}
                        copyTimeout={1000}
                    />
                );
            },
        },
        quantity: {
            render: (row: TManageTransactionHistoryTableRow) => (
                <div className="text-sm text-typo-soft">
                    {handleRenderFallbackText(row.quantity.toString())}
                </div>
            ),
        },
        total: {
            render: (row: TManageTransactionHistoryTableRow) => (
                <div className="text-sm text-typo-soft">
                    {formatCurrency(row.totalPrice)}
                </div>
            ),
        },

        status: {
            render: (row: TManageTransactionHistoryTableRow) =>
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
            render: (row: TManageTransactionHistoryTableRow) => (
                <div className="whitespace-nowrap text-sm text-typo-soft">
                    {formatDateTime(row?.purchaseDate || "").daysTime}
                </div>
            ),
        },
        action: {
            render: (row: TManageTransactionHistoryTableRow) => (
                <div
                    className="flex justify-end"
                    onClick={() => handleDownloadDocuments(row)}
                >
                    <CustomTooltip
                        key={`update-bid-${row.bidId}`}
                        content="Download documents"
                        childClass="group-hover:-translate-y-3.5"
                    >
                        <div className="flex-center flex h-7 w-7 cursor-pointer rounded-sm text-typo-note transition-all hover:bg-bg-sf1 hover:text-typo-soft [&_path]:stroke-current">
                            <div className="h-4 w-4">
                                <IconDownload />
                            </div>
                        </div>
                    </CustomTooltip>
                </div>
            ),
        },
    };

    // Function to get cell renderer for a specific field
    const renderCell = (key: string, row: TManageTransactionHistoryTableRow) =>
        renderCellFromMapping<typeof row>(MAPPING_CONTENT, key, row);
    // Table configuration
    const handleSort = useCallback(
        (field: TSortBy) => {
            // desc -> asc -> none
            if (sortBy !== field) {
                setSortBy(field);
                setOrder("desc");
                return;
            }
            if (order === "desc") {
                setOrder("asc");
                return;
            }
            setSortBy("");
        },
        [order, sortBy, setOrder, setSortBy]
    );

    const TABLE_CONFIG: TTableConfig = useMemo(() => {
        return {
            columns: [
                {
                    key: "caskId",
                    label: () => {
                        return <ItemLabelWithIcon label="Cask" />;
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
                    key: "total",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Total Price"
                                isActive={sortBy === "totalPrice"}
                                icon={<IconToggle />}
                                order={sortBy === "totalPrice" ? order : "none"}
                                onClick={() => handleSort("totalPrice")}
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
                                icon={<IconToggle />}
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
                                label="Purchase Date"
                                isActive={sortBy === "purchaseDate"}
                                icon={<IconToggle />}
                                order={
                                    sortBy === "purchaseDate" ? order : "none"
                                }
                                onClick={() => handleSort("purchaseDate")}
                            />
                        );
                    },
                },
                {
                    key: "action",
                    label: () => <></>,
                },
            ],
            gridCols: "grid-cols-[2fr_1fr_1fr_1fr_1.1fr_0.7fr] group/table-row",
        };
    }, [order, sortBy, handleSort, dialogType]);

    return {
        MAPPING_CONTENT,
        renderCell,
        TABLE_CONFIG,
    };
};
//
