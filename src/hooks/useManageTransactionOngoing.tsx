import CaskInfoCell from "@/components/shared/cask-info-cell";
import IconNavArrow from "@/components/shared/icons/icon-nav-arrow";
import IconSelectVlt from "@/components/shared/icons/icon-select-vlt";
import ItemLabelWithIcon from "@/components/shared/label-w-ic";
import LinkCustom from "@/components/shared/link-custom";
import CustomTooltip from "@/components/shared/tooltips-custom";
import { Badge, TBadgeVariant } from "@/components/ui/badge";
import { ETransactionOnGoingStatus } from "@/enum/transaction";
import { renderCellFromMapping } from "@/helpers";
import { MAPPING_COLOR_STATUS, ROUTE_PUBLIC } from "@/lib/constants";
import {
    formatCurrency,
    formatDateTime,
    handleCamelCaseToSnakeCase,
    handleRenderFallbackText,
} from "@/lib/utils";
import { TSortBy, useManageCask } from "@/modules/mange-cask/provider";
import { cask, TTableConfig, TTableRow } from "@/types";
import { useCallback, useEffect, useMemo } from "react";

// use shared TColumn and TTableConfig
export type TManageTransactionTableRow = TTableRow & {
    cask: cask.TCask & { distilleryName: string };
    totalPrice: number;
    dueBy: string;
    paymentSessionId: string;
    totalAmount: number;
    feeAmount: number;
    expiryDate: string;
    currentStep: ETransactionOnGoingStatus;
};
export const useManageTransactionOngoingTable = () => {
    const { sortBy, order, setSortBy, setOrder } = useManageCask();
    const handleSort = useCallback(
        (field: TSortBy) => {
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

    const renderAction = useCallback((row: TManageTransactionTableRow) => {
        return (
            <div className="flex justify-end">
                <CustomTooltip
                    key={`update-bid-${row.bidId}`}
                    content="Go to transaction page"
                    childClass="group-hover:-translate-y-3.5"
                >
                    <LinkCustom
                        href={`${ROUTE_PUBLIC.CHECKOUT}/${row.id}/${handleCamelCaseToSnakeCase(row.currentStep?.toLowerCase())}`}
                        className="flex-center flex h-7 w-7 cursor-pointer rounded-sm text-typo-note transition-all hover:bg-bg-sf1 hover:text-typo-soft [&_path]:stroke-current"
                    >
                        <div className="h-4 w-4">
                            <IconNavArrow />
                        </div>
                    </LinkCustom>
                </CustomTooltip>
            </div>
        );
    }, []);

    // useEffect(() => {
    //     setSortBy("step");
    // }, []);
    const MAPPING_CONTENT = {
        caskId: {
            render: (row: TManageTransactionTableRow) => {
                return (
                    <CaskInfoCell
                        caskId={row.master?.id}
                        caskName={
                            row?.cask?.master?.name
                                ? ` ${row?.cask?.master?.name} - ${row?.caskName || row?.cask?.name} `
                                : row?.cask?.name
                        }
                        distilleryName={row?.cask?.master?.distillery?.name}
                        imageSrc={row?.cask?.imageUrl || ""}
                        imageAlt={row.caskName}
                        copyTimeout={1000}
                    />
                );
            },
        },
        quantity: {
            render: (row: TManageTransactionTableRow) => (
                <div className="text-sm text-typo-soft">
                    {handleRenderFallbackText(row.quantity.toString())}
                </div>
            ),
        },

        total: {
            render: (row: TManageTransactionTableRow) => {
                return (
                    <div className="text-sm text-typo-soft">
                        {formatCurrency(Number(row?.totalAmount ?? 0))}
                    </div>
                );
            },
        },
        bidType: {
            render: (row: TManageTransactionTableRow) => (
                <div className="text-sm text-typo-soft">
                    {handleRenderFallbackText(row?.bidType || "")}
                </div>
            ),
        },
        step: {
            render: (row: TManageTransactionTableRow) =>
                row.status && (
                    <Badge
                        dot-color={row?.currentStep?.toLowerCase()}
                        variant={
                            MAPPING_COLOR_STATUS[
                                row.currentStep
                            ] as TBadgeVariant
                        }
                    >
                        {row?.currentStep?.split("_").join(" ")}
                    </Badge>
                ),
        },
        expiredAt: {
            render: (row: TManageTransactionTableRow) => (
                <div className="whitespace-nowrap text-sm text-typo-soft">
                    {formatDateTime(row.expiryDate || "").daysTime}
                </div>
            ),
        },
        action: {
            render: (row: TManageTransactionTableRow) => renderAction(row),
        },
    };

    // Function to get cell renderer for a specific field
    const renderCell = (key: string, row: TManageTransactionTableRow) =>
        renderCellFromMapping<typeof row>(MAPPING_CONTENT, key, row);
    // Table configuration
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
                                icon={<IconSelectVlt />}
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
                                icon={<IconSelectVlt />}
                                isActive={sortBy === "totalPrice"}
                                order={sortBy === "totalPrice" ? order : "none"}
                                onClick={() => handleSort("totalPrice")}
                            />
                        );
                    },
                },
                {
                    key: "step",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Status"
                                icon={<IconSelectVlt />}
                                isActive={sortBy === "step"}
                                order={sortBy === "step" ? order : "none"}
                                onClick={() => handleSort("step")}
                            />
                        );
                    },
                },
                {
                    key: "expiredAt",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Due By"
                                icon={<IconSelectVlt />}
                                isActive={sortBy === "dueBy"}
                                order={sortBy === "dueBy" ? order : "none"}
                                onClick={() => handleSort("dueBy")}
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
    }, [sortBy, order, handleSort]);

    return {
        MAPPING_CONTENT,
        renderCell,
        TABLE_CONFIG,
    };
};
