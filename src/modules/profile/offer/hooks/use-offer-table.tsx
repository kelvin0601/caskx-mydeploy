import IconCheck from "@/components/shared/icons/icon-check";
import IconEdit from "@/components/shared/icons/icon-edit";
import IconEye from "@/components/shared/icons/icon-eye";
import IconTrash from "@/components/shared/icons/icon-trash";
import IconCoppy from "@/components/shared/icons/icon-coppy";
import { TRowActionsDropdownItem } from "@/components/shared/row-actions-dropdown";
import { Badge, TBadgeVariant } from "@/components/ui/badge";
import { renderCellFromMapping } from "@/helpers";
import { KEY_BID, ROUTE_PUBLIC } from "@/lib/constants";
import {
    formatDateTime,
    formatCurrency,
    handleRenderFallbackText,
} from "@/lib/utils";
import { useMarketOrderManagement } from "@/modules/market-orders/management/provider";
import { MARKET_ORDER_KIND } from "@/modules/market-orders/constants";
import { caskBidService } from "@/services/cask-bid";
import { TTableConfig, TTableRow } from "@/types";
import { caskAsk } from "@/types/cask-ask";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback, useMemo, useState } from "react";
import LinkCustom from "@/components/shared/link-custom";

type TActionItem = {
    label: string;
    onClick: () => void;
    icon: ReactNode;
};

const getStatusBadgeVariant = (status: string): TBadgeVariant => {
    const statusLower = status?.toLowerCase();
    if (statusLower?.includes("open") || statusLower?.includes("active"))
        return "info";
    if (statusLower?.includes("partially")) return "warning";
    if (statusLower?.includes("payment") || statusLower?.includes("processing"))
        return "progressing";
    if (statusLower?.includes("completed") || statusLower?.includes("won"))
        return "success";
    if (statusLower?.includes("failed") || statusLower?.includes("cancelled"))
        return "destructive";
    if (statusLower?.includes("expired")) return "errorDarker";
    return "default";
};

const getStatusLabel = (status: string): string => {
    if (!status) return "";
    return status.split("_").join(" ");
};

export type TProfileOfferFilters = {
    search?: string;
    page?: number;
    limit?: number;
    size?: number;
    status?: string;
    executionPolicy?: caskAsk.TOrderListFilters["executionPolicy"];
    sortBy?: caskAsk.TOrderListFilters["sortBy"];
    order?: caskAsk.TOrderListFilters["order"];
};

export const useProfileOfferTable = (filters?: TProfileOfferFilters) => {
    const router = useRouter();
    const [dialogData, setDialogData] = useState<TTableRow | null>(null);
    const [dialogType, setDialogType] = useState<string>("");
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const { openUpdate, openCancel, openDuplicate } =
        useMarketOrderManagement();

    const getMyBidsQuery = useQuery({
        queryKey: [KEY_BID.BID_MY_BIDS, filters],
        queryFn: () => caskBidService.getMyBids(filters),
        placeholderData: keepPreviousData,
    });

    const handleViewDetails = useCallback(
        (row: TTableRow) => {
            router.push(`${ROUTE_PUBLIC.OFFER_DETAIL}/${row.id}`);
        },
        [router]
    );

    const handleUpdate = useCallback(
        (row: TTableRow) => openUpdate(row, MARKET_ORDER_KIND.OFFER),
        [openUpdate]
    );

    const handleCancel = useCallback(
        (row: TTableRow) => openCancel(row, MARKET_ORDER_KIND.OFFER),
        [openCancel]
    );

    const handleDuplicate = useCallback(
        (row: TTableRow) => openDuplicate(row, MARKET_ORDER_KIND.OFFER),
        [openDuplicate]
    );

    const renderAction = useCallback(
        (row: TTableRow): TRowActionsDropdownItem[] | null => {
            const statusLower = handleRenderFallbackText(
                row.status
            ).toLowerCase();
            const quantity = Number(row.quantity ?? 0);
            const remainingQuantity = Number(row.remainingQuantity ?? quantity);
            const matchedQuantity = Math.max(0, quantity - remainingQuantity);
            const hasMatches = row.hasMatches ?? matchedQuantity > 0;
            const actions: TRowActionsDropdownItem[] = [];

            if (hasMatches) {
                actions.push({
                    label: "View details",
                    onClick: () => handleViewDetails(row),
                    icon: <IconEye />,
                });
            }

            if (statusLower === "open" || statusLower === "active") {
                actions.push({
                    label: "Update",
                    onClick: () => handleUpdate(row),
                    icon: <IconEdit />,
                });
                actions.push({
                    label: "Cancel",
                    onClick: () => handleCancel(row),
                    icon: <IconTrash />,
                });
            } else if (
                statusLower.includes("partially") ||
                statusLower.includes("partial")
            ) {
                if (!hasMatches) {
                    actions.push({
                        label: "View details",
                        onClick: () => handleViewDetails(row),
                        icon: <IconEye />,
                    });
                }
                actions.push({
                    label: "Update",
                    onClick: () => handleUpdate(row),
                    icon: <IconEdit />,
                });
                actions.push({
                    label: "Cancel",
                    onClick: () => handleCancel(row),
                    icon: <IconTrash />,
                });
            } else if (
                statusLower.includes("processing") ||
                statusLower.includes("payment")
            ) {
                if (!hasMatches) {
                    actions.push({
                        label: "View details",
                        onClick: () => handleViewDetails(row),
                        icon: <IconEye />,
                    });
                }
            } else if (
                statusLower.includes("completed") ||
                statusLower.includes("won")
            ) {
                if (!hasMatches) {
                    actions.push({
                        label: "View details",
                        onClick: () => handleViewDetails(row),
                        icon: <IconEye />,
                    });
                }
                actions.push({
                    label: "Duplicate",
                    onClick: () => handleDuplicate(row),
                    icon: <IconCoppy />,
                });
            } else if (statusLower.includes("cancelled")) {
                actions.push({
                    label: "Duplicate",
                    onClick: () => handleDuplicate(row),
                    icon: <IconCoppy />,
                });
            }

            return actions;
        },
        [handleViewDetails, handleUpdate, handleCancel, handleDuplicate]
    );

    const MAPPING_CONTENT = useMemo(
        () => ({
            caskName: {
                render: (row: TTableRow) => {
                    const name = handleRenderFallbackText(
                        row.master?.name || row.caskName || row.cask?.name
                    );
                    return (
                        <div
                            className="truncate text-sm font-semibold text-typo-primary"
                            title={name}
                        >
                            <LinkCustom
                                href={`${ROUTE_PUBLIC.CASK_DETAILS}/${row.master?.id ?? row.caskId}`}
                            >
                                {name}
                            </LinkCustom>
                        </div>
                    );
                },
            },
            vintage: {
                render: (row: TTableRow) => (
                    <div className="whitespace-nowrap text-sm font-medium text-typo-primary">
                        {handleRenderFallbackText(
                            row.vintageYear ?? row.cask?.vintageYear
                        )}
                    </div>
                ),
            },
            partialFillAllowed: {
                render: (row: TTableRow) => {
                    const allowed =
                        row.executionPolicy === "partial_fill" ||
                        row.executionPolicy === "PARTIAL_FILL" ||
                        row.executionPolicy === "partial_allowed";
                    if (allowed) {
                        return (
                            <span className="flex h-4 w-4 items-center justify-center text-typo-primary">
                                <IconCheck />
                            </span>
                        );
                    }
                    return null;
                },
            },
            status: {
                render: (row: TTableRow) => {
                    const status = getStatusLabel(
                        handleRenderFallbackText(row.status)
                    );
                    const variant = getStatusBadgeVariant(status);
                    return (
                        <Badge
                            variant={variant}
                            size="sm"
                            className="border-transparent font-semibold"
                        >
                            {status}
                        </Badge>
                    );
                },
            },
            requested: {
                render: (row: TTableRow) => {
                    const qty = Number(row.quantity ?? 0);
                    return (
                        <div className="whitespace-nowrap text-sm text-typo-primary">
                            {handleRenderFallbackText(qty)}
                        </div>
                    );
                },
            },
            matched: {
                render: (row: TTableRow) => {
                    const quantity = Number(row.quantity ?? 0);
                    const remainingQuantity = Number(
                        row.remainingQuantity ?? 0
                    );
                    const matched = Math.max(0, quantity - remainingQuantity);
                    return (
                        <div className="whitespace-nowrap text-sm text-typo-primary">
                            {handleRenderFallbackText(
                                matched > 0 ? matched : undefined
                            )}
                        </div>
                    );
                },
            },
            acquired: {
                render: (row: TTableRow) => (
                    <div className="whitespace-nowrap text-sm text-typo-primary">
                        {handleRenderFallbackText(row.filledQuantity)}
                    </div>
                ),
            },
            remaining: {
                render: (row: TTableRow) => {
                    const remaining = Number(row.remainingQuantity ?? 0);
                    return (
                        <div className="whitespace-nowrap text-sm text-typo-primary">
                            {handleRenderFallbackText(remaining)}
                        </div>
                    );
                },
            },
            offerPrice: {
                render: (row: TTableRow) => {
                    const price = row.bidPrice ?? row.price ?? 0;
                    return (
                        <div className="whitespace-nowrap text-sm font-semibold text-typo-primary">
                            {formatCurrency(price)}
                        </div>
                    );
                },
            },
            expires: {
                render: (row: TTableRow) => {
                    if (!row.expirationDate) {
                        return (
                            <div className="whitespace-nowrap text-sm font-medium text-typo-primary">
                                -
                            </div>
                        );
                    }
                    const dateTime =
                        formatDateTime(row.expirationDate).daysTime || "";
                    const parts = dateTime.split(" ");
                    const datePart = parts[0]?.replace(",", "") || "";
                    const timePart = parts[1] || "";
                    return (
                        <div className="whitespace-nowrap text-sm font-medium text-typo-primary">
                            <span>{datePart} </span>
                            <span className="text-typo-soft">{timePart}</span>
                        </div>
                    );
                },
            },
            action: {
                render: (row: TTableRow) => {
                    const actions = renderAction(row);
                    if (!actions) return null;
                    return { __actions: actions } as unknown as ReactNode;
                },
            },
        }),
        [renderAction]
    );

    const renderCell = useCallback(
        (key: string, row: TTableRow) =>
            renderCellFromMapping<TTableRow>(MAPPING_CONTENT, key, row),
        [MAPPING_CONTENT]
    );

    const TABLE_CONFIG: TTableConfig = useMemo(() => {
        return {
            columns: [
                { key: "caskName", label: "Cask" },
                { key: "vintage", label: "Vintage" },
                { key: "partialFillAllowed", label: "Partial fill allowed?" },
                { key: "status", label: "Status" },
                { key: "requested", label: "Requested" },
                { key: "matched", label: "Matched" },
                { key: "acquired", label: "Acquired" },
                { key: "remaining", label: "Remaining" },
                { key: "offerPrice", label: "Offer price" },
                { key: "expires", label: "Expires" },
                { key: "action", label: "" },
            ],
            gridCols:
                "grid-cols-[minmax(12rem,4.775fr)_minmax(4.5rem,1fr)_minmax(7.5rem,1.625fr)_minmax(8.5rem,1.875fr)_minmax(5.5rem,1.2fr)_minmax(5.5rem,1.2fr)_minmax(5.5rem,1.2fr)_minmax(5.5rem,1.2fr)_minmax(7.5rem,1.5fr)_minmax(9.5rem,1.875fr)_minmax(1.875rem,0.375fr)] tb:grid-cols-[minmax(0,1fr)_5rem_8.125rem_9.375rem_6rem_6rem_6rem_6rem_8rem_9.375rem_1.875rem]",
        };
    }, []);

    return {
        MAPPING_CONTENT,
        renderCell,
        TABLE_CONFIG,
        renderAction,
        offers: getMyBidsQuery.data?.data || [],
        total: getMyBidsQuery.data?.total || 0,
        page: getMyBidsQuery.data?.page || 1,
        limit: getMyBidsQuery.data?.limit ?? 20,
        totalPages: getMyBidsQuery.data?.totalPages ?? 0,
        isLoading: getMyBidsQuery.isLoading,
        isError: getMyBidsQuery.isError,
        refetch: getMyBidsQuery.refetch,
        dialogData,
        dialogType,
        isOpenDialog,
        setIsOpenDialog,
        setDialogData,
        setDialogType,
    };
};
