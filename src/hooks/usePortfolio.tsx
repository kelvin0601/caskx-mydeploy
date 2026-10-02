import IconArUp from "@/components/shared/icons/icon-ar-up";
import IconHelp from "@/components/shared/icons/icon-help";
import IconNavArrow from "@/components/shared/icons/icon-nav-arrow";
import IconSelectVlt from "@/components/shared/icons/icon-select-vlt";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import ItemLabelWithIcon from "@/components/shared/label-w-ic";
import LinkCustom from "@/components/shared/link-custom";
import CustomTooltip from "@/components/shared/tooltips-custom";
import { Badge, TBadgeVariant } from "@/components/ui/badge";
import { renderCellFromMapping } from "@/helpers/";
import { MAPPING_COLOR_STATUS, ROUTE_PUBLIC } from "@/lib/constants";
import { formatCurrency, handleRenderFallbackText } from "@/lib/utils";
import { TTableConfig, TTableRow } from "@/types";
import { useMemo } from "react";

export const usePortfolio = () => {
    const renderAction = (row: TTableRow) => {
        return (
            <div className="flex justify-end">
                <CustomTooltip
                    key={`update-bid-${row.bidId}`}
                    content="Go to transaction page"
                    childClass="group-hover:-translate-y-1.5"
                >
                    <LinkCustom
                        href={`${ROUTE_PUBLIC.CASK_DETAILS}/${row.bidId}`}
                        className="flex-center flex h-7 w-7 cursor-pointer rounded-sm text-typo-note transition-all hover:bg-bg-sf1 hover:text-typo-soft [&_path]:stroke-current"
                    >
                        <div className="h-4 w-4">
                            <IconNavArrow />
                        </div>
                    </LinkCustom>
                </CustomTooltip>
            </div>
        );
    };

    const MAPPING_CONTENT = {
        caskId: {
            render: (row: TTableRow) => (
                <div className="flex flex-row items-center gap-3">
                    <div className="h-[3.75rem] w-[3.75rem] flex-shrink-0 overflow-hidden rounded-[0.3125rem]">
                        <ImagePlaceholder
                            src={row.cask?.imageUrl}
                            width={120}
                            height={120}
                            className="h-full w-full"
                            alt={row.caskName}
                        />
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                        <LinkCustom
                            href={`${ROUTE_PUBLIC.CASK_DETAILS}/${row.caskId}`}
                            className="line-clamp-1 text-sm font-medium text-typo-primary"
                        >
                            {row.caskName}
                        </LinkCustom>
                        <div className="text-sm text-typo-soft">
                            {row.bidId}
                        </div>
                    </div>
                </div>
            ),
        },
        quantity: {
            render: (row: TTableRow) => (
                <div className="text-sm text-typo-soft">
                    {handleRenderFallbackText(row.quantity.toString())}
                </div>
            ),
        },
        price: {
            render: (row: TTableRow) => {
                const isHighest = false; // Add your logic here to determine if highest
                return (
                    <div className="flex flex-row items-center gap-2">
                        <div className="text-sm text-typo-soft">
                            {formatCurrency(row.price)}
                        </div>
                        {isHighest && <Badge variant="success">Highest</Badge>}
                    </div>
                );
            },
        },
        total: {
            render: (row: TTableRow) => (
                <div className="flex flex-row items-center gap-2 text-sm text-typo-soft">
                    {formatCurrency(row.total)}
                    <Badge variant="success">
                        <div className="flex flex-row items-center gap-1">
                            <div className="h-4 w-4">
                                <IconArUp />
                            </div>
                            <div className="text-sm">10%</div>
                        </div>
                    </Badge>
                </div>
            ),
        },
        status: {
            render: (row: TTableRow) =>
                row.status && (
                    <Badge
                        variant={
                            MAPPING_COLOR_STATUS[row.status] as TBadgeVariant
                        }
                    >
                        {row.status?.split("_").join(" ")}
                    </Badge>
                ),
        },

        action: {
            render: (row: TTableRow) => renderAction(row),
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
                                isActive={false}
                                icon={<IconSelectVlt />}
                            />
                        );
                    },
                },
                {
                    key: "price",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label="Total Value"
                                isActive={true}
                                icon={<IconSelectVlt />}
                            />
                        );
                    },
                },
                {
                    key: "total",
                    label: () => {
                        return (
                            <ItemLabelWithIcon
                                label={
                                    <div className="flex flex-row items-center gap-2">
                                        <CustomTooltip
                                            content="(Last Sale Price × Quantity) - Total Purchased Value"
                                            childClass="group-hover:-translate-y-1.5"
                                        >
                                            <div className="flex flex-row items-center gap-1">
                                                Total P/L
                                                <div className="h-4 w-4">
                                                    <IconHelp />
                                                </div>
                                            </div>
                                        </CustomTooltip>
                                    </div>
                                }
                                icon={<IconSelectVlt />}
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
                                icon={<IconSelectVlt />}
                            />
                        );
                    },
                },
                {
                    key: "action",
                    label: () => <></>,
                },
            ],
            gridCols: "grid-cols-[1fr_1fr_1fr_1fr_1fr_0.2fr]",
        };
    }, []);

    return {
        MAPPING_CONTENT,
        renderCell,
        TABLE_CONFIG,
    };
};
