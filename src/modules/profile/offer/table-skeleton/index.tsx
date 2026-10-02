"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TTableConfig } from "@/types";
import { TableRow, TableCell } from "@/components/ui/table";

type TTableSkeletonProps = {
    tableConfig: TTableConfig;
    rows?: number;
    showStickyDivider?: boolean;
};

export default function TableSkeleton({
    tableConfig,
    rows = 5,
    showStickyDivider = false,
}: TTableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <TableRow
                    key={index}
                    className="border-b border-bd-main hover:bg-transparent"
                >
                    {tableConfig.columns.map((column) => {
                        const isAction = column.key === "action";
                        const isPartial = column.key === "partialFillAllowed";
                        const isCaskName = column.key === "caskName";

                        return (
                            <TableCell
                                key={column.key}
                                className={cn(
                                    "min-w-0 px-2 py-4 align-middle first:pl-0 last:pr-0",
                                    isCaskName &&
                                        "sticky left-0 z-10 bg-bg-main pr-4",
                                    isCaskName &&
                                        showStickyDivider &&
                                        "after:absolute after:-inset-y-5 after:right-0 after:z-[1] after:border-r after:border-bd-main"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex min-w-0 items-center",
                                        isAction && "justify-end"
                                    )}
                                >
                                    <Skeleton
                                        className={cn(
                                            "bg-bg-sf3",
                                            isAction
                                                ? "h-4 w-4 rounded-full"
                                                : isCaskName
                                                  ? "h-4 w-3/4"
                                                  : isPartial
                                                    ? "h-4 w-6"
                                                    : column.key === "status" ||
                                                        column.key === "expires"
                                                      ? "h-6 w-20 rounded"
                                                      : "h-4 w-8"
                                        )}
                                    />
                                </div>
                            </TableCell>
                        );
                    })}
                </TableRow>
            ))}
        </>
    );
}
