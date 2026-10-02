"use client";

import ImagePreload from "@/components/shared/image-preload";
import {
    Carousel,
    CarouselContent,
    CarouselDotGroup,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    CarouselScrollbar,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import useResponsive from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";
import {
    EmblaCarouselType,
    EmblaEventListType,
    EmblaEventModelType,
} from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import Ssr from "embla-carousel-ssr";
import { useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BannerCard } from "./banner-card";
import { useQuery } from "@tanstack/react-query";
import { CASK_KEYS, BANNER_CASK_FILTER } from "@/lib/constants";
import caskMasterServices from "@/services/cask-master";
import { formatCurrency } from "@/lib/utils";
import { caskMaster } from "@/types";

const TWEEN_FACTOR_BASE = 0.3;
const DEFAULT_SCALE = 0.85;

const numberWithinRange = (number: number, min: number, max: number): number =>
    Math.min(Math.max(number, min), max);

export default function Banner({
    isMobile: isMobileSSR,
    isTablet: isTabletSSR,
}: {
    isMobile: boolean;
    isTablet: boolean;
}) {
    const responsive = useResponsive();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const isMobile = isMounted ? responsive.isMobile : isMobileSSR;
    const isTablet = isMounted ? responsive.isTablet : isTabletSSR;
    const filterParams = BANNER_CASK_FILTER;
    const { data: caskMastersQueryData, isLoading: isBannerLoading } = useQuery(
        {
            queryKey: [CASK_KEYS.LIST_CASK, filterParams],
            queryFn: () =>
                caskMasterServices.getCaskMastersListing(filterParams),
        }
    );
    const list = (
        Array.isArray(caskMastersQueryData)
            ? caskMastersQueryData
            : caskMastersQueryData?.data?.length
              ? caskMastersQueryData.data
              : []
    ) as caskMaster.TCaskMaster[];
    const [api, setApi] = useState<EmblaCarouselType>();
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const tweenFactor = useRef(0);
    const tweenNodes = useRef<HTMLElement[]>([]);
    const carouselWrapperRef = useRef<HTMLDivElement>(null);

    const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
        tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
            return slideNode?.querySelector?.(
                ".banner-card-scale-layer"
            ) as HTMLElement;
        });
    }, []);

    const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
        tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.snapList().length;
    }, []);

    const tweenScale = useCallback(
        <EventType extends keyof EmblaEventListType>(
            emblaApi: EmblaCarouselType,
            event?: EmblaEventModelType<EventType>
        ) => {
            const engine = emblaApi.internalEngine();
            const scrollProgress = emblaApi.scrollProgress();
            const slidesInView = emblaApi.slidesInView();
            const isScrollEvent = event?.type === "scroll";

            emblaApi.snapList().forEach((scrollSnap, snapIndex) => {
                let diffToTarget = scrollSnap - scrollProgress;
                const slidesInSnap =
                    engine.scrollSnapList.slidesBySnap[snapIndex];

                slidesInSnap.forEach((slideIndex) => {
                    if (isScrollEvent && !slidesInView.includes(slideIndex))
                        return;

                    if (engine.options.loop) {
                        engine.slideLooper.loopPoints.forEach((loopItem) => {
                            const target = loopItem.target();

                            if (slideIndex === loopItem.index && target !== 0) {
                                const sign = Math.sign(target);

                                if (sign === -1) {
                                    diffToTarget =
                                        scrollSnap - (1 + scrollProgress);
                                }
                                if (sign === 1) {
                                    diffToTarget =
                                        scrollSnap + (1 - scrollProgress);
                                }
                            }
                        });
                    }

                    const factor =
                        TWEEN_FACTOR_BASE * emblaApi.snapList().length;
                    const tweenValue = 1 - Math.abs(diffToTarget * factor);
                    const scale = numberWithinRange(
                        tweenValue,
                        0,
                        1
                    ).toString();
                    const tweenNode = tweenNodes.current[slideIndex];
                    if (tweenNode) {
                        if (diffToTarget < -0.01) {
                            if (isTablet || isMobile) {
                                tweenNode.style.transformOrigin =
                                    "right center";
                            } else {
                                tweenNode.style.transformOrigin = "bottom";
                            }
                        } else if (diffToTarget > 0.01) {
                            if (isTablet || isMobile) {
                                tweenNode.style.transformOrigin = "left center";
                            } else {
                                tweenNode.style.transformOrigin = "top";
                            }
                        } else tweenNode.style.transformOrigin = "center";

                        tweenNode.style.transform = `scale(${scale})`;
                        tweenNode.style.opacity = scale;
                    }
                });
            });
        },
        [isMobile, isTablet]
    );

    useEffect(() => {
        if (!api) return;
        setIsInitialized(true);
        setTweenNodes(api);
        setTweenFactor(api);
        tweenScale(api);
        setSelectedIndex(api.selectedSnap());

        const handleSelect = () => {
            setSelectedIndex(api.selectedSnap());
        };

        api.on("reinit", () => {
            setTweenNodes(api);
            setTweenFactor(api);
            tweenScale(api);
            handleSelect();
        })
            .on("select", handleSelect)
            .on("scroll", tweenScale)
            .on("slidefocus", tweenScale);
    }, [api, setTweenNodes, setTweenFactor, tweenScale]);

    // useEffect(() => {
    //     const el = carouselWrapperRef.current;
    //     if (!el || !api || isMobile || isTablet) return;

    //     let lastWheelTime = 0;
    //     const WHEEL_COOLDOWN = 600; // ms to prevent fast/inertia updates

    //     const handleWheel = (e: WheelEvent) => {
    //         e.preventDefault();
    //         const { deltaY } = e;
    //         console.log("deltaY", deltaY);

    //         const now = Date.now();
    //         if (now - lastWheelTime < WHEEL_COOLDOWN) {
    //             return;
    //         }

    //         if (e.deltaMode === 0) {
    //             if (e.deltaY < -5) {
    //                 api.goToPrev();
    //                 lastWheelTime = now;
    //             } else if (e.deltaY > 5) {
    //                 api.goToNext();
    //                 lastWheelTime = now;
    //             }
    //         } else {
    //             if (e.deltaY < -50) {
    //                 api.goToPrev();
    //                 lastWheelTime = now;
    //             } else if (e.deltaY > 50) {
    //                 api.goToNext();
    //                 lastWheelTime = now;
    //             }
    //         }
    //     };

    //     el.addEventListener("wheel", handleWheel, { passive: false });
    //     return () => {
    //         el.removeEventListener("wheel", handleWheel);
    //     };
    // }, [api, isMobile, isTablet]);

    const isInView = useInView(carouselWrapperRef, { amount: 0.3 });

    useEffect(() => {
        if (!api) return;
        const autoplay = api?.plugins()?.autoplay;
        if (!autoplay) return;

        if (isInView) {
            autoplay.play();
        } else {
            autoplay.stop();
        }
    }, [api, isInView]);

    // className="col-start-1 -col-end-1 -mx-[var(--padding-container)] contain-paint"
    return (
        <div className="relative h-[50rem] overflow-hidden bg-black tb:h-auto tb:min-h-[45rem] mb:min-h-[auto] mb:rounded-none">
            <ImagePreload
                src="/images/home_hero.jpg"
                alt="Whisky Cellar"
                width={1728}
                height={800}
                className="duration-[1s] absolute inset-0 h-full object-cover opacity-60 transition-transform ease-linear"
                priority
                quality={70}
                sizes="100vw"
            />
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-[7.875rem] bg-gradient-to-b from-[#090300]/60 to-transparent tb:bottom-0 tb:right-auto tb:h-full tb:w-[8.8125rem] tb:bg-gradient-to-l tb:from-transparent tb:to-[#090300]/60 mb:w-9" />

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[7.875rem] bg-gradient-to-t from-[#090300]/60 to-transparent tb:left-auto tb:top-0 tb:h-full tb:w-[8.8125rem] tb:bg-gradient-to-r tb:from-transparent tb:to-[#090300]/60 mb:w-9" />

            <div className="absolute inset-0 z-[1] bg-[linear-gradient(0deg,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.8)_100%)] mb:bg-black/60" />

            <div className="container relative z-10 flex h-full min-h-[50rem] items-center tb:h-auto tb:min-h-[45rem] mb:min-h-[auto]">
                <div className="grid w-full grid-cols-16 tb:grid-cols-12 mb:grid-cols-4">
                    {/* Left Column: Typography */}
                    <div className="col-span-5 col-start-2 flex max-w-[31.75rem] flex-col gap-8 pl-10 pt-[8.125rem] tb:col-span-8 tb:col-start-4 tb:-col-end-3 tb:mb-[3.75rem] tb:gap-7 tb:pl-0 tb:pt-[5.25rem] mb:col-start-1 mb:-col-end-1 mb:w-full mb:gap-4 mb:pt-[7.5rem]">
                        <div className="flex flex-col gap-3 tb:items-center tb:text-center">
                            <h1 className="font-reckless text-8xl font-[300] text-typo-dark-primary tb:text-7xl mb:text-5xl">
                                <span className="text-typo-dark-note">
                                    TOP CASKS
                                </span>
                                <br />
                                WORTH WATCHING <br />
                                <span className="italic">RIGHT NOW</span>
                            </h1>
                        </div>
                        <p className="text-sm text-white-500 tb:text-center">
                            These are selected based on verified trading
                            activity.
                            <br /> Take a look at what&apos;s standing out this
                            week.
                        </p>
                    </div>

                    {/* Right Column: Card Carousel */}
                    <div
                        ref={carouselWrapperRef}
                        className="col-span-5 col-start-10 flex justify-center tb:col-start-1 tb:-col-end-1 tb:-mx-[var(--padding-container)]"
                    >
                        {isBannerLoading ? (
                            <div className="flex h-[50rem] w-full items-center justify-center">
                                <Skeleton className="bg-white/10 h-[30rem] w-[20rem] rounded-lg" />
                            </div>
                        ) : list.length > 0 ? (
                            <Carousel
                                id="carousel-banner"
                                orientation={
                                    isMobile || isTablet
                                        ? "horizontal"
                                        : "vertical"
                                }
                                className={cn(
                                    "relative h-[50rem] w-full max-w-[32.1875rem] tb:mb-[7.25rem] tb:h-auto tb:max-w-none mb:mb-[5.625rem]",
                                    !isInitialized
                                        ? "not-initialized-carousel"
                                        : "is-initialized-carousel"
                                )}
                                setApi={setApi}
                                opts={{
                                    loop: true,
                                    startIndex: 0,
                                    breakpoints: {
                                        "(max-width: 1024px)": {
                                            axis: "x",
                                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                            // @ts-ignore
                                            startIndex: 0,
                                        },
                                    },
                                }}
                                plugins={[
                                    Autoplay({
                                        delay: 5000,
                                        defaultInteraction: true,
                                    }),
                                    Ssr({
                                        slideSizes: Array(list.length).fill(65),
                                        breakpoints: {
                                            "(max-width: 1024px)": {
                                                slideSizes: Array(
                                                    list.length
                                                ).fill(48.5),
                                                active: true,
                                            },
                                            "(max-width: 767px)": {
                                                slideSizes: Array(
                                                    list.length
                                                ).fill(88.64),
                                                active: true,
                                            },
                                        },
                                        active: true,
                                    }),
                                ]}
                            >
                                {!isInitialized && (
                                    <style
                                        dangerouslySetInnerHTML={{
                                            __html: `
                                             .not-initialized-carousel .banner-card-scale-layer {
                                                 transform: scale(${1 - TWEEN_FACTOR_BASE}) !important;
                                                 transform-origin: top center;
                                                 opacity: ${1 - TWEEN_FACTOR_BASE} !important;
                                             }
                                             .not-initialized-carousel .embla__slide:last-child .banner-card-scale-layer {
                                                 transform-origin: bottom center;
                                             }
                                             .not-initialized-carousel .embla__slide:nth-child(1) .banner-card-scale-layer {
                                                 transform: scale(1) !important;
                                                 transform-origin: center !important;
                                                 opacity: 1 !important;
                                             }

                                             @media (max-width:  1024px) {
                                                 .not-initialized-carousel .banner-card-scale-layer {
                                                     transform-origin: left center;
                                                 }
                                                 .not-initialized-carousel .embla__slide:last-child .banner-card-scale-layer {
                                                     transform-origin: right center;
                                                 }
                                             }
                                         `,
                                        }}
                                    />
                                )}
                                <CarouselContent
                                    classNameParent="overflow-hidden h-full"
                                    className="h-full dk:-my-1.5 tb:-mx-1.5 tb:flex-row"
                                    id="carousel-banner"
                                >
                                    {list.map((item, index) => {
                                        const isActive = !isInitialized
                                            ? index === 0
                                            : index === selectedIndex;

                                        return (
                                            <CarouselItem
                                                key={item.id}
                                                className="flex !basis-[65%] items-center justify-center overflow-hidden !py-1.5 !pt-0 tb:!basis-[48.5%] tb:!py-0 tb:px-1.5 tb:pt-0 mb:h-auto mb:!basis-[88.64%]"
                                            >
                                                <BannerCard
                                                    isActive={isActive}
                                                    data={item}
                                                />
                                            </CarouselItem>
                                        );
                                    })}
                                </CarouselContent>
                                <CarouselScrollbar className="absolute left-[calc(100%+6.5rem)] top-1/2 h-32 w-[1px] -translate-y-1/2 tb:hidden" />
                                <CarouselDotGroup className="hidden tb:-bottom-[2rem] tb:flex" />
                                <div className="absolute right-[calc(4.125rem+100%)] top-1/2 flex !translate-x-0 -translate-y-1/2 flex-col gap-0.5 tb:hidden">
                                    <CarouselPrevious
                                        className="size-10 min-w-0"
                                        variant="outline"
                                        mode="dark"
                                        onMouseEnter={
                                            api?.plugins()?.autoplay?.stop
                                        }
                                        onMouseLeave={
                                            api?.plugins()?.autoplay?.reset
                                        }
                                    />
                                    <CarouselNext
                                        className="size-10 min-w-0"
                                        variant="outline"
                                        mode="dark"
                                        onMouseEnter={
                                            api?.plugins()?.autoplay?.stop
                                        }
                                        onMouseLeave={
                                            api?.plugins()?.autoplay?.reset
                                        }
                                    />
                                </div>
                            </Carousel>
                        ) : (
                            <div className="text-white/70 flex h-[50rem] w-full items-center justify-center px-8 text-center text-sm">
                                No casks are available right now.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BannerSkeleton() {
    return (
        <div className="relative min-h-[50rem] overflow-hidden bg-black tb:min-h-[45rem] mb:min-h-[auto] mb:rounded-none">
            <div className="container relative z-10 flex h-full min-h-[50rem] items-center">
                <div className="grid w-full grid-cols-16">
                    <div className="col-start-1 col-end-8 flex flex-col gap-6">
                        <Skeleton className="bg-white/10 h-16 w-3/4" />
                        <Skeleton className="bg-white/10 h-24 w-full" />
                        <div className="flex gap-4">
                            <Skeleton className="bg-white/10 h-12 w-32" />
                            <Skeleton className="bg-white/10 h-12 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
