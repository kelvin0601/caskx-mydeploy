"use client";

import AuthStatus from "@/components/shared/auth/popup-status";
import CaskCardItem, { CaskCardSkeleton } from "@/components/shared/cask-card";
import CaskEmpty from "@/components/shared/cask-notfound";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_KEYS, CASK_KEYS } from "@/lib/constants/key";
import { PARAMS } from "@/lib/constants/route";
import authService from "@/services/auth";
import caskServices from "@/services/cask";
import { useBoundStore } from "@/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, m } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import PaginationBar from "@/components/shared/pagination-bar";
import useResponsive from "@/hooks/useResponsive";
import caskMasterServices from "@/services/cask-master";
import { cn } from "@/lib/utils";

export default function CaskList({
    sortBy,
    search,
    isSidebarCollapsed = false,
}: {
    sortBy: string;
    search: string;
    isSidebarCollapsed?: boolean;
}) {
    const { user, updateCasks, filterCask, clearAll } = useBoundStore();
    const [changeParams, setChangeParams] = useState("");
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { isDesktop } = useResponsive();
    const filterData = params.get(`${PARAMS.filter}`);

    const sortData = sortBy;
    const searchData = search;
    const [size, setSize] = useState(24);
    const [page, setPage] = useState(1);
    const [openAlert, setOpenAlert] = useState(false);
    const queryClient = useQueryClient();
    const resendEmailMutation = useMutation({
        mutationFn: authService.resendEmailVerification,
        gcTime: Infinity,
        mutationKey: [AUTH_KEYS.RESEND_EMAIL],
    });
    const casksQuery = useQuery({
        queryKey: [CASK_KEYS.GET_CASK, changeParams, search, size, page],
        queryFn: async () => {
            return caskMasterServices.getCaskMastersListing(
                `${changeParams}&${PARAMS.size}=${size}&${PARAMS.page}=${page}`
            );
        },
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
    });

    const sizeParams = casksQuery?.data?.size || 0;
    const pageParams = casksQuery?.data?.page || 0;
    const totalRecords = casksQuery?.data?.totalRecords || 0;
    const totalPages = casksQuery?.data?.totalPages || 0;
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
                currentCount={casksQuery.data?.data?.length ?? 0}
                size={size}
                keyRefetch={CASK_KEYS.GET_CASK}
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

                    return caskServices.getCaskListing(
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
                <div className="-mx-2 mb-20 flex flex-wrap gap-y-4 tb:mb-8 mb:mb-6">
                    {Array.from({ length: size }, (_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "ease-[cubic-bezier(0.34,1.56,0.64,1)] px-2 transition-all duration-300",
                                isSidebarCollapsed ? "w-1/4" : "w-1/3",
                                "tb:w-1/2 mb:w-full"
                            )}
                        >
                            <CaskCardSkeleton className="w-full" />
                        </div>
                    ))}
                </div>
                {/* <div className="flex w-full flex-row gap-0.5 border-t border-bd-main pt-5">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                </div> */}
            </div>
        );
    }, [casksQuery.isLoading, isSidebarCollapsed]);

    useEffect(() => {
        const params = [
            filterData && `${filterData}`,
            sortData && `${PARAMS.sortBy}=${sortData}`,
            searchData && `${PARAMS.search}=${searchData}`,
        ]
            .filter(Boolean)
            .join("&");

        setChangeParams(params || "");
        setSize(isDesktop ? 24 : 12);
        setPage(1);
    }, [filterData, sortData, searchData, isDesktop]);

    useEffect(() => {
        if (casksQuery.data) {
            updateCasks(casksQuery.data);
        }
    }, [casksQuery?.data?.data.length]);

    const handleClearAll = useCallback(() => {
        clearAll();
        const newParams = new URLSearchParams(params.toString());
        newParams.delete(PARAMS.filter);
        newParams.delete(PARAMS.sortBy);
        newParams.delete(PARAMS.sortOrder);
        newParams.delete(PARAMS.search);
        const qs = newParams.toString();
        startTransition(() => {
            router.push(`${pathname}${qs ? `?${qs}` : ""}`);
        });
    }, [clearAll, router, pathname, params]);

    return (
        <div className="flex h-full w-full">
            {casksQuery.isLoading ? (
                renderCaskLoading()
            ) : casksQuery.isError ? (
                <div>Error: {casksQuery.error?.message}</div>
            ) : casksQuery.data?.data?.length === 0 ? (
                <div className="flex h-[74vh] w-full">
                    <CaskEmpty onClear={handleClearAll} />
                </div>
            ) : (
                <div className="flex size-full flex-col">
                    <AnimatePresence>
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.2,
                                ease: "easeOut",
                            }}
                            className="h-full"
                        >
                            <div className="-mx-2 mb-8 flex flex-wrap gap-y-4 tb:-mx-1.5 tb:mb-5 tb:gap-y-3 mb:mb-4 mb:gap-y-2">
                                {casksQuery.data?.data?.map((cask) => (
                                    <div
                                        key={cask.id}
                                        className={cn(
                                            "ease-[cubic-bezier(0.34,1.56,0.64,1)] px-2 transition-all duration-300 tb:px-1.5",
                                            isSidebarCollapsed
                                                ? "w-1/4"
                                                : "w-1/3",
                                            "tb:w-1/2 mb:w-full"
                                        )}
                                    >
                                        <CaskCardItem
                                            className="h-full w-full"
                                            data={cask}
                                            isRevert={false}
                                            index={0}
                                        />
                                    </div>
                                ))}
                            </div>
                        </m.div>
                    </AnimatePresence>
                    {user?.isVerified ? renderPagination() : renderVerify()}
                </div>
            )}
        </div>
    );
}
