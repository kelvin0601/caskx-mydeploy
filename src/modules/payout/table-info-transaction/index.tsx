import ImagePlaceholder from "@/components/shared/image-placeholder";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { cask } from "@/types";

export default function TableInfoTransaction({
    title,
    children,
    caskName,
    totalQuantity,
    fulfilledQuantity = 0,
    askPrice,
    estTotalValue,
    currentTotalValue,
    totalUnpaid,
    totalPaid,
    dueDate,
    dueDateLabel,
    caskInfo,
}: {
    children?: React.ReactNode;
    title?: string;
    caskName: string;
    totalQuantity: number;
    askPrice?: number;
    estTotalValue: number;
    currentTotalValue: number;
    totalUnpaid: number;
    totalPaid: number;
    fulfilledQuantity?: number;
    dueDate?: string;
    dueDateLabel?: string;
    caskInfo?: cask.TCask;
}) {
    const tableSummary: {
        label: () => string | React.ReactNode;
        value: string | number;
    }[] = [
        ...(!!askPrice
            ? [
                  {
                      label: () => "Ask Price",
                      value: formatCurrency(askPrice),
                  },
              ]
            : []),
        {
            label: () => "Est. Total Value",
            value: formatCurrency(estTotalValue),
        },
        {
            label: () => "Current Total Value",
            value: formatCurrency(currentTotalValue),
        },
        {
            label: () => "Total Unpaid",
            value: formatCurrency(totalUnpaid),
        },
        {
            label: () => "Total Paid",
            value: formatCurrency(totalPaid),
        },
    ];

    return (
        <div className="flex flex-col gap-8 tb:gap-6 tb:py-8 mb:gap-5 mb:py-6">
            <div className="flex w-full flex-row items-center justify-between">
                <h1 className="text-2xl font-semibold text-typo-primary tb:text-xl">
                    {title}
                </h1>
            </div>
            <Table>
                <TableBody className="block overflow-hidden rounded-md border">
                    <TableRow className="grid grid-cols-4 !gap-x-0 !rounded-none mb:grid-cols-1">
                        <TableCell className="overflow-hidden border-r mb:border-none">
                            <div className="flex-center flex flex-col px-4 mb:flex-row mb:gap-4">
                                <div className="aspect-[104/80] h-20 overflow-hidden rounded-[0.3125rem]">
                                    <ImagePlaceholder
                                        src={caskInfo?.imageUrl}
                                        alt={caskInfo?.name || ""}
                                        width={104}
                                        height={80}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="hidden mb:flex mb:flex-col mb:justify-start mb:text-start">
                                    <div className="break-words text-center text-base font-semibold text-typo-soft">
                                        {caskName}
                                    </div>
                                    <div className="break-words text-center text-sm text-typo-soft">
                                        Quantity: {totalQuantity}
                                    </div>
                                    <div className="break-words text-center text-sm text-typo-soft">
                                        {dueDateLabel || "Due date"}:{" "}
                                        {dueDate
                                            ? formatDateTime(dueDate).dateOnly
                                            : "-"}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="h-full border-r mb:hidden">
                            <div className="flex-center flex h-full flex-col gap-0.5">
                                <div className="text-base font-medium text-typo-primary">
                                    Cask Name
                                </div>
                                <div className="text-center text-sm text-typo-soft">
                                    {caskName}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="h-full border-r mb:hidden">
                            <div className="flex-center flex h-full flex-col gap-0.5">
                                <div className="text-base font-medium text-typo-primary">
                                    Quantity
                                </div>
                                <div className="text-sm text-typo-soft">
                                    {`${totalQuantity}`}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="h-full mb:hidden">
                            <div className="flex-center flex h-full flex-col gap-0.5">
                                <div className="text-base font-medium text-typo-primary">
                                    {dueDateLabel || "Due date"}
                                </div>
                                <div className="text-sm text-typo-soft">
                                    {dueDate
                                        ? formatDateTime(dueDate).dateOnly
                                        : "-"}
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <div className="flex flex-col gap-4 mb:gap-3">
                <h3 className="text-base font-medium text-typo-primary">
                    Ask Summary
                </h3>
                <Table>
                    <TableBody>
                        {tableSummary.map((item, index) => (
                            <TableRow
                                key={index}
                                className="grid grid-cols-2 rounded-none border-b-0 border-t px-4 last:rounded-[0.3125rem] last:bg-bg-sf2 last:hover:bg-bg-sf2 mb:grid-cols-[1fr_auto]"
                            >
                                <TableCell className="text-base font-medium text-typo-primary">
                                    {item.label?.()}
                                </TableCell>
                                <TableCell className="text-right text-base text-typo-soft">
                                    {item?.value}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {children}
        </div>
    );
}
