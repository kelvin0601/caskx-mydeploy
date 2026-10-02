import { cn } from "@/lib/utils";

export function StatItem({
    title,
    value,
    borderRight = true,
    className,
}: {
    title: string;
    value: React.ReactNode;
    borderRight?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                `flex h-full w-36 items-center justify-start gap-3 border-bd-main px-5 py-4 last:pr-0 tb:w-auto tb:px-4 mb:w-auto mb:flex-1 mb:border-b mb:border-r-0 mb:px-0 mb:py-3 ${
                    borderRight ? "border-r" : ""
                }`,
                className
            )}
        >
            <div className="inline-flex flex-col items-start justify-center gap-1">
                <div className="whitespace-nowrap text-xs font-normal leading-[1em] text-typo-note">
                    {title}
                </div>
                <div className="text-sm font-semibold text-typo-primary">
                    {value}
                </div>
            </div>
        </div>
    );
}
