import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { hoverRowClasses } from "../hover-row";
import ImagePreload from "../image-preload";
import { Skeleton } from "@/components/ui/skeleton";

type TDataMarketTable = {
    heads: string[];
    data: { [k: string]: string | number }[];
};

export default function MarketTable(props: TDataMarketTable) {
    const { heads, data } = props;

    return (
        <div className="flex flex-col">
            <Table>
                <TableHeader>
                    <TableRow className="pointer-events-none grid grid-cols-3 !gap-x-0 rounded-none !bg-transparent py-2">
                        {heads.map((head, index, args) => (
                            <TableHead
                                className={cn(
                                    "text-sm font-medium text-typo-soft",
                                    args.length - 1 == index
                                        ? "text-right"
                                        : index == 0
                                          ? "text-left"
                                          : "text-center"
                                )}
                                key={index}
                            >
                                {head}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((rows, index, argRows) => (
                        <TableRow
                            key={index}
                            className={cn(
                                hoverRowClasses("6"),
                                "grid grid-cols-3 !gap-x-0 rounded-none !border-b border-bd-main !bg-transparent"
                            )}
                        >
                            {Object.values(rows).map((cell, i, args) => {
                                return (
                                    <TableCell
                                        key={i}
                                        className={cn(
                                            "relative z-10 flex h-12 w-full flex-1 flex-col justify-center py-0 text-sm capitalize text-typo-soft",
                                            args.length - 1 == i
                                                ? "text-right"
                                                : i == 0
                                                  ? "text-left"
                                                  : "text-center"
                                        )}
                                    >
                                        {typeof cell === "number"
                                            ? formatCurrency(cell)
                                            : typeof cell === "string" &&
                                                cell.includes("-")
                                              ? formatDateTime(cell)
                                                    .daysTime.split(",")
                                                    .map((part, index) => (
                                                        <div key={index}>
                                                            {part.trim()}
                                                        </div>
                                                    ))
                                              : cell}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
export function MarketTableSkeleton() {
    return (
        <div className="flex flex-col">
            <Skeleton className="flex h-12 w-full flex-row gap-1 p-1 [&>*]:flex-1">
                <Skeleton className="h-full w-full bg-bg-sf2" />
                <Skeleton className="h-full w-full bg-bg-sf2" />
                <Skeleton className="h-full w-full bg-bg-sf2" />
            </Skeleton>
            <div className="mt-4 flex h-2 flex-row gap-6 px-8 [&>*]:flex-1">
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-full w-full" />
            </div>
            <div className="mt-8 flex flex-col">
                {Array.from({ length: 10 }).map((_, index) => (
                    <div
                        className="mb-5 flex flex-row gap-8 border-b border-bd-brown pb-5"
                        key={index}
                    >
                        <Skeleton className="h-2 w-full bg-bg-sf2" />
                        <Skeleton className="h-2 w-full bg-bg-sf2" />
                        <Skeleton className="h-2 w-full bg-bg-sf2" />
                    </div>
                ))}
            </div>
        </div>
    );
}
export function MarketTableEmpty({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="mx-auto flex max-w-[18.5rem] flex-col items-center pt-16">
            <div className="mb-6 aspect-[220/178] w-[11.5625rem]">
                <ImagePreload
                    src={"/images/empty_market-data.png"}
                    width={100}
                    height={100}
                    alt="Empty Market Data"
                    className="h-full w-full"
                />
            </div>
            <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="text-lg font-semibold text-typo-primary">
                    {title}
                </div>
                <div className="text-sm text-typo-soft">{description}</div>
            </div>
        </div>
    );
}
