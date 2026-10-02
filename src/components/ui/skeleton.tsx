import { cn } from "@/lib/utils";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse bg-bg-sf2 motion-reduce:animate-none dark:bg-bg-dark-sf3",
                className
            )}
            {...props}
        />
    );
}

export { Skeleton };
