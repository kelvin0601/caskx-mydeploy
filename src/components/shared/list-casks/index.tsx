import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselDotButton,
    CarouselDotGroup,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import useResponsive from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";
import { cask, caskMaster, distillery } from "@/types";
import { useRef } from "react";
import CaskCard, { CaskCardSkeleton } from "../cask-card";
import DistilleryCard, { DistilleryCardSkeleton } from "../distillery-card";
import DistilleryCardDetail from "../distillery-card-if";
import CategoryCard, { CategoryCardSkeleton } from "../category-card";
import HeadingContent, { HeadingContentSkeleton } from "../heading";
import LinkCustom from "../link-custom";
import { TCategory } from "../category-card";
import { OptionsType } from "embla-carousel";

type TListCardItem =
    | distillery.TDistillery
    | distillery.TTopDistillery
    | cask.TCask
    | caskMaster.TCaskMaster
    | caskMaster.TSimilarCaskMaster
    | TCategory;

type TListCardType =
    | "distillery"
    | "cask"
    | "distillery_large"
    | "category"
    | "similar_cask";

type TMapSize = {
    desktop2XL: number;
    desktopXL: number;
    desktop: number;
    tablet: number;
    mobile: number;
};

type TListCardCommonProps = {
    title?: string;
    subTitle?: string;
    isRevert?: boolean;
    href?: string;
    isDisableViewAll?: boolean;
    className?: string;
    classNameCarousel?: string;
    isSmallTitle?: boolean;
    isChildCask?: boolean;
    pagination?: boolean;
    opts?: Partial<OptionsType>;
};

type TListCardProps = TListCardCommonProps & {
    lists?: TListCardItem[];
    type: TListCardType;
};

export type TCustomListCardProps<TItem> = TListCardCommonProps & {
    lists?: readonly TItem[];
    type: "custom";
    renderItem: (item: TItem, index: number) => React.ReactNode;
    getItemKey?: (item: TItem, index: number) => React.Key;
    itemClassName?: string;
    customMapSize?: Partial<TMapSize>;
};

function getBreakpoint({
    isMobile,
    isTablet,
    isDesktop2XL,
    isDesktopXL,
}: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop2XL: boolean;
    isDesktopXL: boolean;
}) {
    switch (true) {
        case isMobile:
            return "mobile" as const;
        case isTablet:
            return "tablet" as const;
        case isDesktop2XL:
            return "desktop2XL" as const;
        case isDesktopXL:
            return "desktopXL" as const;
        default:
            return "desktop" as const;
    }
}

function CustomListCardData<TItem>({
    lists,
    className,
    classNameCarousel,
    pagination,
    opts,
    renderItem,
    getItemKey,
    itemClassName,
    customMapSize,
}: TCustomListCardProps<TItem>) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const { isMobile, isTablet, isDesktop2XL, isDesktopXL } = useResponsive();

    if (!lists?.length) return null;

    const mapSize: TMapSize = {
        desktop2XL: 4,
        desktopXL: 4,
        desktop: 4,
        tablet: 3,
        mobile: 1,
        ...customMapSize,
    };
    const lengthToShow =
        mapSize[
            getBreakpoint({ isMobile, isTablet, isDesktop2XL, isDesktopXL })
        ];

    return (
        <div className={cn("flex flex-col py-10 mb:pb-8", className)}>
            <Carousel
                opts={{
                    slidesToScroll: Math.max(1, Math.floor(lengthToShow)),
                    ...(opts || {}),
                }}
                ref={carouselRef}
                className={classNameCarousel}
            >
                <CarouselContent
                    className="flex flex-row gap-4 overflow-visible tb:gap-3 mb:gap-2"
                    classNameParent="overflow-hidden"
                    onPointerDown={() => {
                        carouselRef.current?.classList.add(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                    onPointerUp={() => {
                        carouselRef.current?.classList.remove(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                >
                    {lists.map((item, index) => (
                        <div
                            key={getItemKey?.(item, index) ?? index}
                            className={cn("min-w-0 shrink-0", itemClassName)}
                        >
                            {renderItem(item, index)}
                        </div>
                    ))}
                </CarouselContent>
                {pagination && (
                    <CarouselDotGroup className="relative bottom-auto left-auto mx-auto mt-4 hidden translate-x-0 tb:flex" />
                )}
            </Carousel>
        </div>
    );
}

function DomainListCardData({
    lists,
    type,
    title,
    subTitle,
    isRevert,
    href,
    isDisableViewAll,
    className,
    classNameCarousel,
    isSmallTitle,
    isChildCask = false,
    pagination,
    opts,
}: TListCardProps) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const { isMobile, isTablet, isDesktop2XL, isDesktopXL } = useResponsive();
    if (!lists?.length) return null;
    const typeMap = {
        cask: {
            component: () => (
                <CarouselContent
                    className={cn(
                        "-mx-5 flex flex-row overflow-visible pt-8 tb:-mx-1 tb:pt-4",
                        isSmallTitle && "pt-7"
                    )}
                    classNameParent="overflow-hidden tb:overflow-visible"
                    onPointerDown={() => {
                        carouselRef.current?.classList.add(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                    onPointerUp={() => {
                        carouselRef.current?.classList.remove(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                >
                    {lists?.map((cask, index) => {
                        const item = cask as caskMaster.TCaskMaster;
                        return (
                            <CaskCard
                                isChildCask={isChildCask}
                                data={item}
                                key={item.id}
                                index={index}
                                isRevert={!!isRevert}
                                className="w-[33.33%] px-2 tb:w-[33.33%] tb:px-1 mb:w-[50%]"
                            />
                        );
                    })}
                </CarouselContent>
            ),
            mapSize: {
                desktop2XL: 3,
                desktopXL: 3,
                desktop: 3,
                tablet: 2,
                mobile: 2,
            },
        },
        similar_cask: {
            component: () => (
                <CarouselContent
                    className={cn(
                        "-mx-2 flex flex-row overflow-visible pt-4 tb:-mx-1.5 mb:-mx-1",
                        isSmallTitle && "pt-7"
                    )}
                    classNameParent="overflow-hidden tb:overflow-visible"
                    onPointerDown={() => {
                        carouselRef.current?.classList.add(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                    onPointerUp={() => {
                        carouselRef.current?.classList.remove(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                >
                    {lists?.map((cask, index) => {
                        const item = cask as
                            | caskMaster.TCaskMaster
                            | caskMaster.TSimilarCaskMaster;
                        return (
                            <CaskCard
                                isChildCask={isChildCask}
                                data={item}
                                key={item.id}
                                index={index}
                                isRevert={!!isRevert}
                                className="w-[25%] px-2 tb:w-[50%] tb:px-1.5 mb:w-[84%] mb:px-1"
                            />
                        );
                    })}
                </CarouselContent>
            ),
            mapSize: {
                desktop2XL: 4,
                desktopXL: 4,
                desktop: 3,
                tablet: 2,
                mobile: 1,
            },
        },
        distillery: {
            component: () => (
                <CarouselContent
                    className={cn(
                        "-mx-[0.5625rem] flex cursor-grab flex-row pt-4 tb:-mx-1.5 tb:pt-4 mb:-mx-1"
                    )}
                    onPointerDown={() => {
                        carouselRef.current?.classList.add(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                    classNameParent="overflow-visible"
                    onPointerUp={() => {
                        carouselRef.current?.classList.remove(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                >
                    {lists?.map((distillery, index) => {
                        const item = distillery as distillery.TTopDistillery;
                        return (
                            <DistilleryCard
                                index={index}
                                data={item}
                                key={item.distilleryId}
                                className="w-[25%] px-[0.5625rem] tb:w-[33.33%] tb:px-1.5 mb:w-[74.51%] mb:px-1"
                            />
                        );
                    })}
                </CarouselContent>
            ),
            mapSize: {
                desktop2XL: 4,
                desktopXL: 4,
                desktop: 4,
                tablet: 3,
                mobile: 1,
            },
        },
        distillery_large: {
            component: () => (
                <CarouselContent
                    className={cn(
                        "-mx-2 flex flex-row overflow-visible pt-4 tb:-mx-1.5",
                        isSmallTitle && "pt-7"
                    )}
                    classNameParent="overflow-hidden"
                    onPointerDown={() => {
                        carouselRef.current?.classList.add(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                    onPointerUp={() => {
                        carouselRef.current?.classList.remove(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                >
                    {lists?.map((dis) => {
                        const item = dis as distillery.TDistillery;
                        return (
                            <DistilleryCardDetail
                                data={item}
                                key={item.id}
                                className="h-auto w-[25%] !flex-none px-2 tb:w-[50%] tb:px-1.5 mb:w-[75%] 2xl-desktop:w-[25%]"
                            />
                        );
                    })}
                </CarouselContent>
            ),
            mapSize: {
                desktop2XL: 4,
                desktopXL: 4,
                desktop: 4,
                tablet: 2,
                mobile: 1,
            },
        },
        category: {
            component: () => (
                <CarouselContent
                    className={cn(
                        "-mx-2 flex flex-row overflow-visible pt-4 tb:-mx-1.5 tb:pt-4 mb:-mx-1"
                    )}
                    classNameParent="overflow-visible"
                    onPointerDown={() => {
                        carouselRef.current?.classList.add(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                    onPointerUp={() => {
                        carouselRef.current?.classList.remove(
                            "[&_*]:cursor-grabbing"
                        );
                    }}
                >
                    {lists?.map((category) => {
                        const item = category as TCategory;
                        return (
                            <CategoryCard
                                data={item}
                                key={item.id}
                                className="w-[25%] flex-shrink-0 px-2 tb:w-[41.7%] tb:px-1.5 mb:w-[74.51%] mb:px-1"
                            />
                        );
                    })}
                </CarouselContent>
            ),
            mapSize: {
                desktop2XL: 4,
                desktopXL: 4,
                desktop: 4,
                tablet: 2.2,
                mobile: 1,
            },
        },
    };

    const { mapSize } = typeMap[type];
    const lengthToShow =
        mapSize[
            getBreakpoint({ isMobile, isTablet, isDesktop2XL, isDesktopXL })
        ];
    const renderHeader = () => {
        const isShowButtonNavigate = lists?.length > lengthToShow;
        return (
            <div className="flex-between flex flex-row">
                {title && (
                    <HeadingContent
                        subTitle={subTitle}
                        className={cn(
                            "py-1.5 tb:py-2 mb:py-2.5",
                            isSmallTitle && "text-2xl"
                        )}
                    >
                        {title}
                    </HeadingContent>
                )}
                <div className="flex-center flex flex-row gap-1 overflow-hidden">
                    {isShowButtonNavigate && (
                        <>
                            <CarouselPrevious
                                className="tb:hidden"
                                variant={"outline"}
                            />
                            <CarouselNext
                                className="tb:hidden"
                                variant={"outline"}
                            />
                        </>
                    )}
                    {!isDisableViewAll && (
                        <>
                            <Button
                                key={"btn-desktop"}
                                asChild
                                variant="outline-text"
                                className="h-10 text-typo-primary"
                            >
                                <LinkCustom href={href || ""}>
                                    View All
                                </LinkCustom>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    if (lists?.length === 0) {
        return null;
    }
    return (
        <div className={cn("flex flex-col py-10 mb:pb-8", className)}>
            <Carousel
                opts={{
                    slidesToScroll: Math.max(1, Math.floor(lengthToShow)),
                    ...(opts || {}),
                }}
                ref={carouselRef}
                className={classNameCarousel}
            >
                {renderHeader()}
                {typeMap[type].component()}
                {pagination && (
                    <CarouselDotGroup className="hidden tb:relative tb:bottom-auto tb:left-auto tb:mx-auto tb:mt-4 tb:flex tb:translate-x-0" />
                )}
            </Carousel>
        </div>
    );
}

export default function ListCardData<TItem = never>(
    props: TListCardProps | TCustomListCardProps<TItem>
) {
    if (props.type === "custom") {
        return <CustomListCardData {...props} />;
    }

    return <DomainListCardData {...props} />;
}

export function ListCardSkeleton({
    type,
    className,
}: {
    type: "cask" | "distillery" | "distillery_large" | "category";
    className?: string;
}) {
    // Keep the skeleton count in sync with the matching carousel viewport.
    const cardsPerView = {
        cask: {
            desktop: 3,
            tablet: 2,
            mobile: 2,
        },
        distillery: {
            desktop: 4,
            tablet: 3,
            mobile: 1,
        },
        distillery_large: {
            desktop: 4,
            tablet: 2,
            mobile: 1,
        },
        category: {
            desktop: 4,
            tablet: 2,
            mobile: 1,
        },
    };

    const maxItems = Math.max(...Object.values(cardsPerView[type]));

    const typeMap = {
        cask: {
            component: () => (
                <div className="-mx-5 flex flex-row overflow-visible pt-8 tb:-mx-1 tb:pt-4">
                    {Array.from({ length: maxItems }).map((_, index) => (
                        <CaskCardSkeleton
                            key={index}
                            className={cn(
                                "w-[33.33%] !flex-none px-2 tb:w-[33.33%] tb:px-1 mb:w-[50%]",
                                // Hide items based on screen size
                                index >= 4 && "hidden 2xl-desktop:block"
                            )}
                        />
                    ))}
                </div>
            ),
        },
        distillery: {
            component: () => (
                <div className="-mx-[0.5625rem] flex flex-row pt-12">
                    {Array.from({ length: maxItems }).map((_, index) => (
                        <DistilleryCardSkeleton
                            key={index}
                            className={cn(
                                "w-[25%] !flex-none px-[0.5625rem] tb:w-[25%] tb:px-1 mb:w-[40%]",
                                // Hide items based on screen size
                                index >= 5 && "hidden xl-desktop:block",
                                index >= 6 && "hidden 2xl-desktop:block"
                            )}
                        />
                    ))}
                </div>
            ),
        },
        distillery_large: {
            component: () => (
                <div className="-mx-2 flex flex-row overflow-visible pt-12 tb:pt-4">
                    {Array.from({ length: maxItems }).map((_, index) => (
                        <CaskCardSkeleton
                            key={index}
                            className={cn(
                                "h-auto w-[25%] !flex-none px-2 tb:w-[50%] tb:px-1 mb:w-[76.92%] 2xl-desktop:w-[25%]",
                                // Hide items based on screen size
                                index >= 4 && "hidden"
                            )}
                        />
                    ))}
                </div>
            ),
        },
        category: {
            component: () => (
                <div className="-mx-2 flex flex-row pt-4">
                    {Array.from({ length: maxItems }).map((_, index) => (
                        <CategoryCardSkeleton
                            key={index}
                            className="w-[25%] px-2 tb:w-[40%] mb:w-[50%]"
                        />
                    ))}
                </div>
            ),
        },
    };

    const renderHeader = () => {
        return (
            <div className="flex-between flex flex-row">
                <HeadingContentSkeleton />
                <div className="flex flex-row gap-2 mb:hidden">
                    <Skeleton className="h-10 w-10 bg-bg-sf3" />
                    <Skeleton className="h-10 w-10 bg-bg-sf3" />
                    <Skeleton className="h-10 w-32 bg-bg-sf3" />
                </div>
            </div>
        );
    };
    // if (!isEmpty(maxItems)) {
    //     return null;
    // }
    return (
        <div
            className={cn(
                "flex flex-col pb-[5rem] pt-10 tb:pb-8 mb:pb-6",
                className
            )}
        >
            <div className="flex flex-col">
                {renderHeader()}
                {typeMap[type].component()}
            </div>
        </div>
    );
}
