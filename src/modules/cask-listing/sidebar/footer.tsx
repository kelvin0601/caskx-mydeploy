import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { PARAMS } from "@/lib/constants/route";
import { cn } from "@/lib/utils";
import { useBoundStore } from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useCallback } from "react";

export default function SideBarFooter({ className }: { className: string }) {
    const { setOpen } = useSidebar();
    const { casks, clearAll, tags } = useBoundStore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    return (
        <div
            className={cn(
                "mt-4 hidden border-t border-bd-main bg-bg-main pt-4 mb:block",
                className
            )}
        >
            <div className="flex flex-row items-center justify-center gap-2 px-6 py-4 tb:px-0 tb:pt-0">
                {!tags.length ? (
                    <Button
                        type="button"
                        variant={"outline"}
                        className="h-10 flex-1 rounded-none border-bd-main text-sm font-medium"
                        onClick={() => {
                            setOpen(false);
                        }}
                    >
                        Close
                    </Button>
                ) : (
                    <Button
                        variant={"action"}
                        type="submit"
                        className="h-10 flex-1 rounded-none text-sm font-medium"
                        onClick={() => {
                            setOpen(false);
                        }}
                    >
                        Show results
                    </Button>
                )}
            </div>
        </div>
    );
}

export function SideBarFooterSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("border-t border-bd-main bg-bg-main", className)}>
            <div className="flex flex-row items-center justify-center gap-2 px-6 py-4">
                <Skeleton className="h-11 flex-1 rounded-none" />
                <Skeleton className="h-11 flex-1 rounded-none" />
            </div>
        </div>
    );
}
