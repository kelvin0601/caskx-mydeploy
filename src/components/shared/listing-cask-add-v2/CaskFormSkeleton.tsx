"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CaskFormSkeleton() {
    return (
        <div className="space-y-8 tb:space-y-6 mb:space-y-4">
            {/* 1. General Information */}
            <div className="flex flex-col gap-4 rounded-none border border-bd-main bg-bg-main p-8 tb:p-6 mb:p-4">
                <Skeleton className="h-6 w-44" />
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-11 rounded-full" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="aspect-square size-[180px] max-w-full rounded-none" />
                    </div>
                </div>
            </div>

            {/* 2. Agreement to sign */}
            <div className="flex flex-col gap-4 rounded-none border border-bd-main bg-bg-main p-8 tb:p-6 mb:p-4">
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-6 w-44" />
                    <Skeleton className="h-4 w-80 max-w-full" />
                </div>
                <div className="flex w-full flex-col gap-4">
                    <div className="flex w-full gap-2 tb:flex-col tb:gap-4">
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                    <div className="flex w-full gap-2 tb:flex-col tb:gap-4">
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                    <div className="flex w-full gap-[10px] tb:flex-col tb:gap-4">
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="min-w-0 flex-1 tb:hidden" />
                    </div>
                </div>
            </div>

            {/* 3. Vintage Management */}
            <div className="overflow-hidden border border-bd-main bg-bg-main">
                <div className="flex items-center justify-between gap-4 border-b border-bd-main p-8 tb:p-6 mb:flex-col mb:items-start mb:p-4">
                    <div className="space-y-1">
                        <Skeleton className="h-6 w-44" />
                        <Skeleton className="h-4 w-80 max-w-full" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex items-stretch tb:flex-col">
                    <div className="w-[17.375rem] shrink-0 border-r border-bd-main tb:w-full tb:border-b tb:border-r-0">
                        <div className="flex flex-col">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    className="flex flex-col gap-1.5 border-b border-bd-main px-8 py-4 last:border-b-0 tb:px-6 mb:px-4 mb:py-3"
                                    key={index}
                                >
                                    <Skeleton className="h-5 w-12" />
                                    <Skeleton className="h-5 w-28" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-6 p-8 tb:p-6 mb:p-4">
                        <div className="flex flex-col gap-6 bg-bg-sf4 p-6 mb:p-4">
                            <Skeleton className="h-5 w-36" />
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 tb:grid-cols-1">
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                                <div className="col-span-2 space-y-1.5 tb:col-span-1">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 bg-bg-sf4 p-6 mb:p-4">
                            <Skeleton className="h-5 w-48" />
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 tb:grid-cols-1">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div className="space-y-1.5" key={index}>
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 bg-bg-sf4 p-6 mb:p-4">
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-80 max-w-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-6 tb:grid-cols-1">
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
