"use client";

import AuthStatus from "@/components/shared/auth/popup-status";
import DistilleriesEmpty from "@/components/shared/distilleries-notfound";
import DistilleryCardDetail, {
    DistilleryCardDetailSkeleton,
} from "@/components/shared/distillery-card-if";
import PaginationBar from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_KEYS, DISTILLERY_KEYS } from "@/lib/constants/key";
import { PARAMS } from "@/lib/constants/route";
import { cn } from "@/lib/utils";
import authService from "@/services/auth";
import distilleriesServices from "@/services/distilleries";
import { useBoundStore } from "@/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useTransition,
} from "react";
import useResponsive from "@/hooks/useResponsive";

export default function DistilleriesList({
    sortBy,
    search,
    isSidebarCollapsed = false,
}: {
    sortBy: string;
    search: string;
    isSidebarCollapsed?: boolean;
}) {
    const { user, updateDistilleriesList, clearAllDistilleries } =
        useBoundStore();
    const [changeParams, setChangeParams] = useState("");
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const filterData = params.get(`${PARAMS.filter}`);
    const sortData = sortBy;
    const searchData = search;
    const [size, setSize] = useState(30);
    const [page, setPage] = useState(1);
    const [openAlert, setOpenAlert] = useState(false);
    const queryClient = useQueryClient();
    const { isDesktop } = useResponsive();

    const resendEmailMutation = useMutation({
        mutationFn: authService.resendEmailVerification,
        gcTime: Infinity,
        mutationKey: [AUTH_KEYS.RESEND_EMAIL],
    });
    const queryParams = `${changeParams}${changeParams ? "&" : ""}${PARAMS.size}=${size}&${PARAMS.page}=${page}`;

    const distilleriesQuery = useQuery({
        queryKey: [
            DISTILLERY_KEYS.GET_DISTILLERIES,
            { changeParams, search, size, page },
        ],
        queryFn: async () => {
            try {
                const result =
                    await distilleriesServices.getDistilleriesListing(
                        queryParams
                    );
                // Ensure we always return a valid structure
                return (
                    result || {
                        data: [],
                        totalRecords: 0,
                        totalPages: 0,
                        page: 1,
                        size: size,
                    }
                );
            } catch (error) {
                const err = error as Error & { code?: string };
                if (
                    err?.message === "canceled" ||
                    err?.name === "CanceledError" ||
                    err?.code === "ERR_CANCELED"
                ) {
                    throw error;
                }
                console.error("Error fetching distilleries listing:", error);
                // Return a fallback structure on error
                return {
                    data: [],
                    totalRecords: 0,
                    totalPages: 0,
                    page: 1,
                    size: size,
                };
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
    });

    const sizeParams = distilleriesQuery?.data?.size || 0;
    const pageParams = distilleriesQuery?.data?.page || 0;
    const totalRecords = distilleriesQuery?.data?.totalRecords || 0;
    const totalPages = distilleriesQuery?.data?.totalPages || 0;
    const visibleItems = isDesktop ? 7 : 4;

    const renderPagination = useCallback(() => {
        return (
            <PaginationBar
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                pageParams={pageParams}
                sizeParams={sizeParams}
                totalRecords={totalRecords}
                currentCount={distilleriesQuery.data?.data?.length ?? 0}
                size={size}
                keyRefetch={DISTILLERY_KEYS.GET_DISTILLERIES}
                changeParams={changeParams}
                visibleItems={visibleItems}
                baseFilters={{
                    filter: filterData,
                    sortBy,
                    search,
                    size,
                }}
                prefetchFn={(filters) => {
                    const params = [
                        filters.filter && `${filters.filter}`,
                        filters.sortBy && `${PARAMS.sortBy}=${filters.sortBy}`,
                        filters.search && `${PARAMS.search}=${filters.search}`,
                    ]
                        .filter(Boolean)
                        .join("&");

                    return distilleriesServices.getDistilleriesListing(
                        `${params}&${PARAMS.size}=${filters.size}&${PARAMS.page}=${filters.page}`
                    );
                }}
            />
        );
    }, [
        page,
        pageParams,
        sizeParams,
        totalRecords,
        totalPages,
        changeParams,
        size,
        sortBy,
        search,
        filterData,
        visibleItems,
    ]);

    const renderVerify = useCallback(() => {
        const buttonState = {
            pending: {
                title: "Resending verification email...",
                isDisable: true,
            },
            success: {
                title: "Verify your email to see more",
                isDisable: true,
            },
            error: {
                title: "Verify your email to see more",
                isDisable: false,
            },
            idle: {
                title: "Verify your email to see more",
                isDisable: false,
            },
        };

        const handleResendMail = async () => {
            const isDisable = buttonState[resendEmailMutation.status].isDisable;
            if (!user?.email || !user || isDisable) return;

            await resendEmailMutation.mutateAsync(user.email);
            queryClient.invalidateQueries({ queryKey: [AUTH_KEYS.WHOAMI] });
            setOpenAlert(true);
        };

        return (
            <div className="flex-center -mt-[1.125rem] mb-[6.25rem] flex w-full">
                <Dialog open={openAlert} onOpenChange={setOpenAlert}>
                    <div className="flex flex-col items-center gap-1.5">
                        <Button
                            variant={"outline"}
                            size={"lg"}
                            disabled={
                                buttonState[resendEmailMutation.status]
                                    .isDisable
                            }
                            onClick={handleResendMail}
                        >
                            {buttonState[resendEmailMutation.status].title}
                        </Button>
                        {resendEmailMutation.error?.message && (
                            <div className="text-sm font-medium text-destructive">
                                {resendEmailMutation.error?.message ||
                                    "Something went wrong"}
                            </div>
                        )}
                    </div>
                    <DialogContent className="p-0">
                        <>
                            <DialogTitle className="sr-only">
                                Check your mailbox
                            </DialogTitle>
                            <AuthStatus
                                status="resend"
                                buttonText="Got it"
                                title="Check your mailbox"
                                className="p-8"
                                action={() => setOpenAlert(false)}
                            >
                                Please follow the instructions in your mailbox
                                to verify your account. If you don’t see it,
                                check your spam folder or your credentials.
                            </AuthStatus>
                        </>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }, [user, openAlert, setOpenAlert, resendEmailMutation]);
    const renderCaskLoading = useCallback(() => {
        return (
            <div className="mb-20 flex flex-col">
                <div className="-mx-2 mb-8 flex flex-wrap gap-y-4 tb:-mx-1.5 tb:mb-5 tb:gap-y-3 mb:mb-4 mb:gap-y-2">
                    {Array.from({ length: size }, (_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "ease-[cubic-bezier(0.34,1.56,0.64,1)] px-2 transition-all duration-300 tb:px-1.5",
                                isSidebarCollapsed ? "w-1/4" : "w-1/3",
                                "tb:w-1/2 mb:w-full"
                            )}
                        >
                            <DistilleryCardDetailSkeleton className="w-full" />
                        </div>
                    ))}
                </div>
                <div className="mb-10 flex w-full items-center justify-between border-t border-bd-main pt-5 tb:mb-5 mb:mb-4 mb:flex-col mb:justify-center mb:gap-4">
                    <div className="flex-center mx-auto gap-1 mb:gap-1">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </div>
            </div>
        );
    }, [distilleriesQuery.isLoading, isSidebarCollapsed, size]);

    useEffect(() => {
        const params = [
            filterData && `${filterData}`,
            sortData && `${PARAMS.sortBy}=${sortData}`,
            searchData && `${PARAMS.search}=${searchData}`,
        ]
            .filter(Boolean)
            .join("&");

        setChangeParams(params || "");
        setSize(isDesktop ? 30 : 12);
        setPage(1);
    }, [filterData, sortData, searchData, isDesktop]);

    useEffect(() => {
        if (distilleriesQuery.data) {
            updateDistilleriesList(distilleriesQuery.data);
        }
    }, [distilleriesQuery?.data?.data.length]);
    const handleClearAll = useCallback(() => {
        clearAllDistilleries();
        const newParams = new URLSearchParams(params.toString());
        newParams.delete(PARAMS.filter);
        newParams.delete(PARAMS.sortBy);
        newParams.delete(PARAMS.sortOrder);
        newParams.delete(PARAMS.search);
        const qs = newParams.toString();
        startTransition(() => {
            router.push(`${pathname}${qs ? `?${qs}` : ""}`);
        });
    }, [clearAllDistilleries, router, pathname, params]);

    return (
        <div className="w-full">
            {distilleriesQuery.isLoading ? (
                renderCaskLoading()
            ) : distilleriesQuery.isError ? (
                <div>Error: {distilleriesQuery.error?.message}</div>
            ) : distilleriesQuery.data?.data?.length === 0 ? (
                <DistilleriesEmpty onClear={handleClearAll} />
            ) : (
                <div className="flex flex-col">
                    <div className="-mx-2 mb-8 flex flex-wrap gap-y-4 tb:-mx-1.5 tb:mb-5 tb:gap-y-3 mb:mb-4 mb:gap-y-2">
                        {distilleriesQuery.data?.data?.map((distillery) => (
                            <div
                                key={distillery.id}
                                className={cn(
                                    "ease-[cubic-bezier(0.34,1.56,0.64,1)] px-2 transition-all duration-300 tb:px-1.5",
                                    isSidebarCollapsed ? "w-1/4" : "w-1/3",
                                    "tb:w-1/2 tb:px-1.5 mb:w-full"
                                )}
                            >
                                <DistilleryCardDetail
                                    className="h-full w-full"
                                    key={distillery.id}
                                    data={distillery}
                                />
                            </div>
                        ))}
                    </div>
                    {user?.isVerified ? renderPagination() : renderVerify()}
                </div>
            )}
        </div>
    );
}
