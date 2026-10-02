import ListCardData, { ListCardSkeleton } from "@/components/shared/list-casks";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { cn } from "@/lib/utils";
import { distillery } from "@/types";
import { UseQueryResult } from "@tanstack/react-query";
import { AxiosError } from "axios";

export default function Related({
    className,
    data,
}: {
    className?: string;
    data: UseQueryResult<
        {
            relatedDistilleries: distillery.TDistillery[];
            total: number;
        },
        {
            status: number;
            statusCode: number;
            message: string;
            data: AxiosError<distillery.TDistillery[]>;
        }
    >;
}) {
    return (
        <div
            className={cn(
                "-mx-[var(--padding-container)] overflow-hidden border-t border-bd-main px-[var(--padding-container)] tb:mt-0",
                className
            )}
        >
            {data?.isLoading ? (
                <div className="overflow-hidden">
                    <ListCardSkeleton type="distillery_large" />
                </div>
            ) : (
                <ListCardData
                    href={`${ROUTE_PUBLIC.DISTILLERY}`}
                    type="distillery_large"
                    isDisableViewAll
                    opts={{
                        align: "start",
                        slidesToScroll: 1,
                        loop: true,
                        // breakpoints: {
                        //     "(min-width: 768px)": {
                        //         slidesToScroll: 3,
                        //     },
                        // },
                    }}
                    pagination
                    classNameCarousel="tb:[&>div]:overflow-visible"
                    className="overflow-hidden pb-10 tb:py-8 mb:overflow-visible [&_*[data-dot-active='true']]:!bg-bd-inverse [&_*[data-dot='true']]:bg-bd-surface dk:[&_*[data-dot='true']]:hidden"
                    title="Related Distilleries"
                    lists={data?.data?.relatedDistilleries}
                />
            )}
        </div>
    );
}
