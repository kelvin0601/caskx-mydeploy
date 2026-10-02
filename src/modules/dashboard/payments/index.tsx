"use client";

import IconArrowRight from "@/components/shared/icons/icon-arrow-right";
import LinkCustom from "@/components/shared/link-custom";
import { Badge } from "@/components/ui/badge";
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
import { PARAMS, ROUTE_DASHBOARD } from "@/lib/constants";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { TRANSACTION_STATUS_OPTIONS } from "@/lib/constants/transaction-status";
import {
    cn,
    formatCurrency,
    getCheckoutStatusBadgeVariant,
    getCheckoutStatusLabel,
} from "@/lib/utils";
import PaginationBar from "@/components/shared/pagination-bar";
import { checkoutServices } from "@/services/checkout";
import { checkout } from "@/types/checkout";
import {
    keepPreviousData,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type TStatus = checkout.TStatusCheckout | "invoice_submitted";

type TPaymentRow = {
    id: string;
    buyer: string;
    sellers: string;
    quantity: number;
    total: string;
    status: TStatus;
    rawData?: unknown;
};

export function StatusBadge({ status }: { status: TStatus }) {
    return (
        <Badge
            variant={getCheckoutStatusBadgeVariant(status)}
            className="whitespace-nowrap"
        >
            {getCheckoutStatusLabel(status)}
        </Badge>
    );
}

export default function PaymentsModule() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const rawPage = Number(searchParams.get(PARAMS.page));
    const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const rawStatus = searchParams.get(PARAMS.status);
    const statusFilter: TStatus | "ALL" = TRANSACTION_STATUS_OPTIONS.some(
        (option) => option.value === rawStatus
    )
        ? (rawStatus as TStatus)
        : "ALL";
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

    const normalizedStatus: TStatus | undefined =
        statusFilter === "ALL" ? undefined : statusFilter;

    // Fetch checkout sessions from API
    const { data: checkoutSessionsData, isLoading } = useQuery({
        queryKey: [
            CHECKOUT_KEYS.GET_ADMIN_SESSIONS,
            {
                page,
                size: pageSize,
                status: normalizedStatus,
            },
        ],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            try {
                const result = await checkoutServices.getAdminCheckoutSessions({
                    page,
                    size: pageSize,
                    status: normalizedStatus as
                        | checkout.TStatusCheckout
                        | undefined,
                });
                return (
                    result || {
                        data: [],
                        totalRecords: 0,
                        totalPages: 0,
                        page: 1,
                        size: pageSize,
                    }
                );
            } catch (error) {
                // if (
                //     error?.message === "canceled" ||
                //     error?.name === "CanceledError" ||
                //     error?.code === "ERR_CANCELED"
                // ) {
                //     throw error;
                // }
                console.error("Error fetching checkout sessions:", error);
                return {
                    data: [],
                    totalRecords: 0,
                    totalPages: 0,
                    page: 1,
                    size: pageSize,
                };
            }
        },
        staleTime: 30 * 1000, // 30 seconds
    });

    const totalPages = checkoutSessionsData?.totalPages || 1;
    const totalRecords = checkoutSessionsData?.totalRecords || 0;
    const pageParams = checkoutSessionsData?.page || page;
    const sizeParams = checkoutSessionsData?.size || pageSize;

    // Prefetch function for status filter
    const handlePrefetchStatus = (status: TStatus | "ALL") => {
        const normalized: TStatus | undefined =
            status === "ALL" ? undefined : (status as TStatus);
        queryClient.prefetchQuery({
            queryKey: [
                CHECKOUT_KEYS.GET_ADMIN_SESSIONS,
                {
                    page: 1, // Reset to page 1 for new filter
                    size: pageSize,
                    status: normalized,
                },
            ],
            queryFn: async () => {
                return await checkoutServices.getAdminCheckoutSessions({
                    page: 1,
                    size: pageSize,
                    status: normalized as checkout.TStatusCheckout | undefined,
                });
            },
        });
    };

    return (
        <div className="flex flex-1 flex-col">
            {/* Page Header */}
            <div className="flex h-20 items-center justify-between border-b border-bd-main px-10">
                <div className="flex flex-col gap-1">
                    <h1 className="font-reckless text-xl font-medium leading-none text-typo-primary">
                        Payments
                    </h1>
                    <p className="text-sm font-normal leading-snug text-typo-sub">
                        View and manage all payment transactions.
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col gap-8 px-10 pt-10">
                <div className="flex items-center justify-end">
                    <div className="flex items-center gap-2">
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                updateUrlParams({ status: value, page: 1 });
                            }}
                        >
                            <SelectTrigger
                                className="h-10 min-w-[4.5rem] px-3 text-sm"
                                subLabel="Filter: "
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">
                                    All statuses
                                </SelectItem>
                                {TRANSACTION_STATUS_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        onMouseEnter={() =>
                                            handlePrefetchStatus(
                                                option.value as TStatus
                                            )
                                        }
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <div
                        className={cn(
                            "overflow-hidden rounded-tl-lg rounded-tr-lg border border-border",
                            isLoading && "rounded-b-lg",
                            checkoutSessionsData?.data?.length === 0 &&
                                "rounded-b-lg"
                        )}
                    >
                        <Table>
                            <TableHeader className="bg-bg-sf1">
                                <TableRow className="grid min-h-[4.5rem] grid-cols-[1fr_1.6fr_1.6fr_1fr_1.5080291971fr_1.5919708029fr_1.180291971fr] !gap-x-0 !rounded-none">
                                    <TableHead className="p-3 text-sm">
                                        Payment ID
                                    </TableHead>
                                    <TableHead className="p-3 text-sm">
                                        Buyer
                                    </TableHead>
                                    <TableHead className="p-3 text-sm">
                                        Seller(s)
                                    </TableHead>
                                    <TableHead className="p-3 text-sm">
                                        Quantity
                                    </TableHead>
                                    <TableHead className="p-3 text-sm">
                                        Total
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
                                            colSpan={7}
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
                                ) : checkoutSessionsData?.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-32 text-center text-typo-disable"
                                        >
                                            No payments found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    checkoutSessionsData?.data.map((row) => (
                                        <TableRow
                                            onClick={() => {
                                                router.push(
                                                    `${ROUTE_DASHBOARD.PAYMENTS}/${row.id}`
                                                );
                                            }}
                                            onMouseEnter={() => {
                                                router.prefetch(
                                                    `${ROUTE_DASHBOARD.PAYMENTS}/${row.id}`
                                                );
                                            }}
                                            className="group grid cursor-pointer grid-cols-[1fr_1.6fr_1.6fr_1fr_1.5080291971fr_1.5919708029fr_1.180291971fr] !gap-x-0 !rounded-none"
                                            key={row.id}
                                        >
                                            <TableCell className="p-3">
                                                <p className="line-clamp-1">
                                                    {row.id}
                                                </p>
                                            </TableCell>
                                            <TableCell className="p-3">
                                                {row?.buyer?.email}
                                            </TableCell>
                                            <TableCell className="p-3">
                                                {row.sellers?.[0]?.email}
                                            </TableCell>
                                            <TableCell className="p-3">
                                                {row.quantity}
                                            </TableCell>
                                            <TableCell className="p-3">
                                                {formatCurrency(
                                                    row.totalAmount
                                                )}
                                            </TableCell>
                                            <TableCell className="p-3">
                                                <StatusBadge
                                                    status={row.status}
                                                />
                                            </TableCell>
                                            <TableCell className="p-3 text-right">
                                                <div className="flex items-center justify-end p-4 text-typo-note transition-colors group-hover:text-typo-primary">
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
                        pageParams={pageParams}
                        sizeParams={sizeParams}
                        totalRecords={totalRecords}
                        currentCount={checkoutSessionsData?.data?.length || 0}
                        size={pageSize}
                        changeParams=""
                        keyRefetch={CHECKOUT_KEYS.GET_ADMIN_SESSIONS}
                        className="mb-0 rounded-lg rounded-tl-none rounded-tr-none border border-t-0 px-6 py-5"
                        visibleItems={5}
                        baseFilters={{
                            status:
                                statusFilter === "ALL"
                                    ? undefined
                                    : (statusFilter as TStatus),
                            size: pageSize,
                            page,
                        }}
                        prefetchFn={(filters: Record<string, unknown>) => {
                            return checkoutServices.getAdminCheckoutSessions({
                                page: filters.page as number,
                                size: (filters.size as number) || pageSize,
                                status: filters.status as
                                    | checkout.TStatusCheckout
                                    | undefined,
                            });
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
