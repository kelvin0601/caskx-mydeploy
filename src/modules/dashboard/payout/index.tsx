"use client";

import IconArrowRight from "@/components/shared/icons/icon-arrow-right";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AdminPayoutStatus } from "@/enum/payout";
import { EBadgeVariant } from "@/enum/transaction";
import { KEY_PAYOUT, PARAMS, ROUTE_DASHBOARD } from "@/lib/constants";
import {
    cn,
    convertStringToLabel,
    formatCurrency,
    handleRenderFallbackText,
} from "@/lib/utils";
import PaginationBar from "@/components/shared/pagination-bar";
import payoutServices from "@/services/payout";
import { payout } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

function StatusBadge({ status }: { status: payout.TAdminPayoutStatus }) {
    const statusMap = {
        not_ready: EBadgeVariant.STATIC,
        ready: EBadgeVariant.COMPLETE,
        processing: EBadgeVariant.TRANSACTION,
        completed: EBadgeVariant.SUCCESS,
        failed: EBadgeVariant.STATIC,
    } as const;
    return (
        <Badge variant={statusMap[status as keyof typeof statusMap]}>
            {status.split("_").join(" ")}
        </Badge>
    );
}

export default function PayoutModule() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const rawPage = Number(searchParams.get(PARAMS.page));
    const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const rawStatus = searchParams.get(PARAMS.status);
    const statusFilter: payout.TAdminPayoutStatus | "" = Object.values(
        AdminPayoutStatus
    ).some((status) => status === rawStatus)
        ? (rawStatus as payout.TAdminPayoutStatus)
        : "";
    const pageSize = 20;
    const updateUrlParams = useCallback(
        (updates: { page?: number; status?: string }) => {
            const params = new URLSearchParams(searchParams.toString());
            if (updates.page !== undefined) {
                if (updates.page > 1) {
                    params.set(PARAMS.page, String(updates.page));
                } else {
                    params.delete(PARAMS.page);
                }
            }
            if (updates.status !== undefined) {
                if (updates.status && updates.status !== "ALL") {
                    params.set(PARAMS.status, updates.status);
                } else {
                    params.delete(PARAMS.status);
                }
            }
            const query = params.toString();
            router.replace(`${pathname}${query ? `?${query}` : ""}`, {
                scroll: false,
            });
        },
        [pathname, router, searchParams]
    );
    const payoutQuery = useQuery({
        queryKey: [
            KEY_PAYOUT.GET_ADMIN_SETTLEMENTS,
            { page, size: pageSize, status: statusFilter || undefined },
        ],
        placeholderData: keepPreviousData,
        queryFn: () =>
            payoutServices.getAdminSettlements({
                page,
                size: pageSize,
                status: statusFilter || undefined,
            }),
    });

    const isLoading = payoutQuery.isLoading && !payoutQuery.data;
    const totalPages = payoutQuery.data?.totalPages ?? 1;
    const totalRecords = payoutQuery.data?.totalRecords ?? 0;
    const pageRows = payoutQuery.data?.data ?? [];

    return (
        <div className="flex flex-1 flex-col">
            {/* Page Header */}
            <div className="flex h-20 items-center justify-between border-b border-bd-main px-10">
                <div className="flex flex-col gap-1">
                    <h1 className="font-reckless text-xl font-medium leading-none text-typo-primary">
                        Payouts
                    </h1>
                    <p className="text-sm font-normal leading-snug text-typo-sub">
                        View and manage payout transactions.
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col gap-8 px-10 pt-10">
                {/* Status Filter */}
                <div className="flex items-center justify-end">
                    <div className="flex items-center gap-2">
                        <Select
                            value={statusFilter || "ALL"}
                            onValueChange={(value) => {
                                updateUrlParams({ status: value, page: 1 });
                            }}
                        >
                            <SelectTrigger
                                className="h-10 min-w-[4.5rem] px-2 text-sm capitalize"
                                subLabel="Filter: "
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">
                                    All statuses
                                </SelectItem>
                                {Object.values(AdminPayoutStatus).map(
                                    (option) => (
                                        <SelectItem
                                            key={option}
                                            value={option}
                                            className="capitalize"
                                        >
                                            {option.split("_").join(" ")}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <div
                        className={cn(
                            "overflow-hidden rounded-tl-lg rounded-tr-lg border border-border",
                            isLoading && "rounded-b-lg",
                            pageRows.length === 0 && "rounded-b-lg"
                        )}
                    >
                        <Table>
                            <TableHeader className="bg-bg-sf1">
                                <TableRow className="grid grid-cols-[1fr_1.5fr_2fr_1.7080291971fr_1.2fr_0.7080291971fr] !gap-x-0 !rounded-none">
                                    <TableHead className="p-3 text-sm">
                                        Payout ID
                                    </TableHead>
                                    <TableHead className="p-3 text-sm">
                                        Seller
                                    </TableHead>
                                    <TableHead className="p-3 text-sm">
                                        Linked Transaction
                                    </TableHead>
                                    <TableHead className="p-3 text-sm">
                                        Payout amount
                                    </TableHead>
                                    <TableHead className="p-3 text-sm">
                                        Status
                                    </TableHead>
                                    <TableHead className="p-3 text-right text-sm"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow className="pointer-events-none">
                                        <TableCell
                                            colSpan={6}
                                            className="h-32 text-center"
                                        >
                                            <div className="flex items-center justify-center">
                                                <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent"></div>
                                                <span className="ml-2">
                                                    Loading...
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : pageRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-32 text-center text-typo-disable"
                                        >
                                            No payouts found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pageRows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            onClick={() => {
                                                router.push(
                                                    `${ROUTE_DASHBOARD.PAYOUT}/${row.id}`
                                                );
                                            }}
                                            onMouseEnter={() => {
                                                router.prefetch(
                                                    `${ROUTE_DASHBOARD.PAYOUT}/${row.id}`
                                                );
                                            }}
                                            className="group/row grid min-h-[4.5rem] cursor-pointer grid-cols-[1fr_1.5fr_2fr_1.7080291971fr_1.2fr_0.7080291971fr] !gap-x-0 !rounded-none"
                                        >
                                            <TableCell className="p-3">
                                                <p className="line-clamp-1">
                                                    {row.id}
                                                </p>
                                            </TableCell>
                                            <TableCell className="p-3">
                                                {handleRenderFallbackText(
                                                    row.seller.email
                                                )}
                                            </TableCell>
                                            <TableCell className="z-10 p-3">
                                                <Button
                                                    variant="link"
                                                    asChild
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(
                                                            `${ROUTE_DASHBOARD.PAYMENTS}/${row.references.checkoutSessionId}`
                                                        );
                                                    }}
                                                >
                                                    <p className="line-clamp-1">
                                                        {handleRenderFallbackText(
                                                            row.references
                                                                .checkoutSessionId
                                                        )}
                                                    </p>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="p-3">
                                                {formatCurrency(
                                                    row.totalAmount
                                                )}
                                            </TableCell>
                                            <TableCell className="p-3">
                                                <StatusBadge
                                                    status={row.payoutStatus}
                                                />
                                            </TableCell>
                                            <TableCell className="p-3 text-right">
                                                <div className="flex items-center justify-end p-4 text-typo-note transition-colors group-hover/row:text-typo-primary">
                                                    <div className="size-4">
                                                        <IconArrowRight />
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <PaginationBar
                        page={page}
                        setPage={(nextPage) =>
                            updateUrlParams({ page: nextPage })
                        }
                        totalPages={totalPages}
                        pageParams={page}
                        sizeParams={pageSize}
                        totalRecords={totalRecords}
                        currentCount={pageRows.length}
                        size={pageSize}
                        changeParams="page"
                        keyRefetch={KEY_PAYOUT.GET_ADMIN_SETTLEMENTS}
                        className="mb-0 rounded-lg rounded-tl-none rounded-tr-none border border-t-0 px-6 py-5"
                        visibleItems={5}
                    />
                </div>
            </div>
        </div>
    );
}
