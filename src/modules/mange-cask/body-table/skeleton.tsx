"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import type { TColumn, TTableConfig } from "@/types";

export default function BodyTableSkeleton({
    TABLE_CONFIG,
    rows = 10,
    tabPlaceholders = ["All", "Open", "Filled"],
}: {
    TABLE_CONFIG: TTableConfig;
    rows?: number;
    tabPlaceholders?: string[];
}) {
    const columns = TABLE_CONFIG.columns as TColumn[];

    return (
        <div>
            <Tabs value="" className="relative bg-transparent p-0">
                <div className="sticky top-0 z-20 bg-bg-main">
                    <div className="mb-6 flex flex-row items-center justify-between">
                        <TabsList className="overflow-hiddenp-1 flex w-max flex-row items-start gap-1 rounded-lg border border-bd-brown bg-bg-main">
                            {tabPlaceholders.map((label, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-row items-center gap-2 rounded-md px-3 py-1.5"
                                >
                                    <Skeleton className="h-4 w-14" />
                                    <Skeleton className="h-4 w-6 rounded-3xl" />
                                </div>
                            ))}
                        </TabsList>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-56" />
                        </div>
                    </div>
                </div>
                <TabsContent
                    value=""
                    className="flex-1 rounded-t-md border border-bd-brown p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow
                                className={`grid ${TABLE_CONFIG.gridCols} !gap-x-0 rounded-none rounded-t-md bg-bg-sf1`}
                            >
                                {columns.map((column) => (
                                    <TableHead key={column.key} className="p-0">
                                        <div className="p-3">
                                            <Skeleton className="h-16 w-24" />
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: rows }).map((_, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    className={`grid hover:bg-transparent ${TABLE_CONFIG.gridCols} !gap-x-0 rounded-none`}
                                >
                                    {columns.map((column) => (
                                        <TableCell
                                            key={`${rowIndex}-${column.key}`}
                                            className="px-3 py-4"
                                        >
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
                <div className="rounded-b-md border border-t-0 border-solid px-6 py-5">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-24" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-14" />
                        </div>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
