import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
type TItemSecuritySkeleton = {
    isActive?: boolean;
    haveRightContent?: boolean;
    haveMidContent?: boolean;
};

export const ItemSecuritySkeleton = (props: TItemSecuritySkeleton) => {
    const { isActive, haveRightContent, haveMidContent } = props;
    return (
        <div
            className={cn(
                "border-b-[1px] border-bd-main",
                isActive && "!border-transparent"
            )}
        >
            <Skeleton
                className={cn(
                    "grid grid-cols-[1.088fr_1fr_0.3fr] items-center !gap-x-0 !bg-transparent py-4",
                    isActive && "!bg-bg-sf4"
                )}
            >
                <div
                    className={cn(
                        "col-start-1 flex flex-row items-center gap-3",
                        isActive && "pl-4"
                    )}
                >
                    <Skeleton
                        className={cn(
                            "col-start-1 h-10 w-10",
                            isActive && "bg-bg-sf2"
                        )}
                    />
                    <div className="col-start-2 flex flex-1 flex-col gap-2">
                        <Skeleton
                            className={cn("h-4 w-1/2", isActive && "bg-bg-sf2")}
                        />
                        <Skeleton
                            className={cn("h-3 w-1/3", isActive && "bg-bg-sf2")}
                        />
                    </div>
                </div>
                {haveMidContent && (
                    <div className="col-start-2">
                        <Skeleton
                            className={cn("h-4 w-1/3", isActive && "bg-bg-sf2")}
                        />
                    </div>
                )}
                {haveRightContent && (
                    <div className={cn("col-start-3", isActive && "pr-4")}>
                        <Skeleton
                            className={cn(
                                "h-4 w-full",
                                isActive && "bg-bg-sf2"
                            )}
                        />
                    </div>
                )}
            </Skeleton>
        </div>
    );
};
