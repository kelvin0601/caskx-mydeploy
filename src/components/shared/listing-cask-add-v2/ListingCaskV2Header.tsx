import IconArrowNarrowLeft from "@/components/shared/icons/icon-arrow-narrow-left";
import IconDotsHorizontal from "@/components/shared/icons/icon-dots-horizontal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, isValid } from "date-fns";
import type { ReactNode } from "react";

type Props = {
    title?: ReactNode;
    status?: "active" | "inactive" | string;
    updatedAt?: string | Date;
    onBack?: () => void;
    onMoreActions?: () => void;
    moreActions?: ReactNode;
    left?: ReactNode;
    right?: ReactNode;
    className?: string;
};

export function ListingCaskV2Header({
    title,
    status,
    updatedAt,
    onBack,
    onMoreActions,
    moreActions,
    left,
    right,
    className,
}: Props) {
    const updatedDate =
        typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;
    const formattedDate =
        updatedDate && isValid(updatedDate)
            ? format(updatedDate, "dd/MM/yyyy HH:mm")
            : null;

    return (
        <div
            className={cn(
                "sticky top-0 z-20 flex min-h-20 w-full items-center gap-4 border-b border-bd-main bg-bg-main px-10 py-5 tb:top-16 tb:px-6 tb:py-4 mb:min-h-16 mb:gap-2 mb:px-4 mb:py-3",
                className
            )}
        >
            <div className="flex min-w-0 flex-1 items-center gap-4">
                {left ? (
                    left
                ) : (
                    <>
                        {onBack && (
                            <Button
                                className="min-w-0 p-0"
                                variant="empty"
                                type="button"
                                onClick={onBack}
                                aria-label="Go back"
                            >
                                <IconArrowNarrowLeft className="size-5 text-typo-primary" />
                            </Button>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col justify-end gap-1.5">
                            <div className="flex min-w-0 items-center gap-2">
                                <h1 className="m-0 min-w-0 truncate text-lg font-semibold text-typo-primary mb:text-base">
                                    {title}
                                </h1>
                                {status && (
                                    <span
                                        className={cn(
                                            "inline-flex h-5 shrink-0 items-center gap-1 rounded-full bg-bg-sf3 px-2 py-0.5 text-xs font-semibold",
                                            status === "active"
                                                ? "text-success"
                                                : "text-typo-note"
                                        )}
                                    >
                                        {status === "active"
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                )}
                            </div>
                            {formattedDate && (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-typo-soft mb:hidden">
                                    <span>Last updated</span>
                                    <span className="text-typo-primary">
                                        {formattedDate}
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
                {right}
                {moreActions ??
                    (onMoreActions ? (
                        <Button
                            type="button"
                            variant="empty"
                            size="icon"
                            className="rounded-full p-0 text-icon-main hover:bg-bg-sf4 focus-visible:bg-bg-sf4 mb:size-8"
                            onClick={onMoreActions}
                            aria-label="More actions"
                        >
                            <IconDotsHorizontal className="size-5" />
                        </Button>
                    ) : null)}
            </div>
        </div>
    );
}
