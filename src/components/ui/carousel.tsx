"use client";

import { Button } from "@/components/ui/button";
import { findClosestIndex } from "@/helpers";
import { cn, isEmpty } from "@/lib/utils";
import { EmblaCarouselType, OptionsType } from "embla-carousel";
import useEmblaCarousel, {
    type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import * as React from "react";
import { m, AnimatePresence, LayoutGroup } from "motion/react";
import IconChevonDown from "../shared/icons/icon-chevon-down";
import IconChevonTop from "../shared/icons/icon-chevon-top";
import { usePrevNextButtons } from "./carrousel-arrow-button";
import { Skeleton } from "./skeleton";
import IconChevonLeft from "../shared/icons/icon-chevon-left";
import IconChevonRight from "../shared/icons/icon-chevon-right";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
    opts?: CarouselOptions;
    plugins?: CarouselPlugin;
    orientation?: "horizontal" | "vertical";
    setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
    carouselRef: ReturnType<typeof useEmblaCarousel>[0];
    api: ReturnType<typeof useEmblaCarousel>[1];
    scrollPrev: () => void;
    scrollNext: () => void;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    carouselId?: string;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
    const context = React.useContext(CarouselContext);

    if (!context) {
        throw new Error("useCarousel must be used within a <Carousel />");
    }

    return context;
}
type UseDotButtonType = {
    selectedIndex: number;
    scrollSnaps: number[];
    onDotButtonClick: (index: number) => void;
    prevId: number;
    nextId: number;
    direction: number;
};

const useDotButton = (
    emblaApi: EmblaCarouselType | undefined,
    onButtonClick?: (emblaApi: EmblaCarouselType) => void
): UseDotButtonType => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);
    const [direction, setDirection] = React.useState(1);
    const onDotButtonClick = React.useCallback(
        (index: number) => {
            if (!emblaApi) return;
            emblaApi.goTo(index);
            if (onButtonClick) onButtonClick(emblaApi);
        },
        [emblaApi, onButtonClick]
    );

    const onInit = React.useCallback((emblaApi: EmblaCarouselType) => {
        setScrollSnaps(emblaApi.snapList());
    }, []);

    const onSelect = React.useCallback((emblaApi: EmblaCarouselType) => {
        setSelectedIndex(emblaApi.selectedSnap());

        const scrollDirection = emblaApi
            .internalEngine()
            .scrollBody.direction();
        if (scrollDirection !== 0) {
            // Embla moves the track in the opposite direction of the slide index.
            setDirection(scrollDirection < 0 ? 1 : -1);
        }
    }, []);

    React.useEffect(() => {
        if (!emblaApi) return;

        onInit(emblaApi);
        onSelect(emblaApi);

        emblaApi
            .on("reinit", onInit)
            .on("reinit", onSelect)
            .on("select", onSelect);
    }, [emblaApi, onInit, onSelect]);

    const prevId =
        scrollSnaps.length > 0
            ? selectedIndex === 0
                ? scrollSnaps.length - 1
                : selectedIndex - 1
            : 0;
    const nextId =
        scrollSnaps.length > 0
            ? selectedIndex === scrollSnaps.length - 1
                ? 0
                : selectedIndex + 1
            : 0;

    return {
        selectedIndex,
        scrollSnaps,
        onDotButtonClick,
        prevId,
        nextId,
        direction,
    };
};
type UseAutoplayType = {
    autoplayIsPlaying: boolean;
    toggleAutoplay: (value?: boolean) => void;
    onAutoplayButtonClick: (callback: () => void) => void;
};

export const useAutoplay = (
    emblaApi: EmblaCarouselType | undefined
): UseAutoplayType => {
    const [autoplayIsPlaying, setAutoplayIsPlaying] = React.useState(false);

    const onAutoplayButtonClick = React.useCallback(
        (callback: () => void) => {
            const autoplay = emblaApi?.plugins()?.autoplay;
            if (!autoplay) return;

            const resetOrStop =
                autoplay.options.defaultInteraction === false
                    ? autoplay.reset
                    : autoplay.stop;

            resetOrStop();
            callback();
        },
        [emblaApi]
    );

    const toggleAutoplay = React.useCallback(() => {
        const autoplay = emblaApi?.plugins()?.autoplay;
        if (!autoplay) return;

        const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play;
        playOrStop();
    }, [emblaApi]);

    React.useEffect(() => {
        const autoplay = emblaApi?.plugins()?.autoplay;
        if (!autoplay) return;

        setAutoplayIsPlaying(autoplay.isPlaying());
        emblaApi
            .on("autoplay:play", () => setAutoplayIsPlaying(true))
            .on("autoplay:stop", () => setAutoplayIsPlaying(false))
            .on("reinit", () => setAutoplayIsPlaying(autoplay.isPlaying()));
    }, [emblaApi]);

    return {
        autoplayIsPlaying,
        toggleAutoplay,
        onAutoplayButtonClick,
    };
};

const Carousel = React.forwardRef<
    HTMLDivElement | null,
    React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
    (
        {
            orientation = "horizontal",
            opts,
            setApi,
            plugins,
            className,
            children,
            id,
            ...props
        },
        ref
    ) => {
        const [carouselRef, api, serverApi] = useEmblaCarousel(
            {
                ...opts,
                skipSnaps: true,
                axis: orientation === "horizontal" ? "x" : "y",
            },
            plugins
        );
        const renderSsrStyles = !api && serverApi;
        const {
            prevBtnDisabled,
            nextBtnDisabled,
            onPrevButtonClick,
            onNextButtonClick,
        } = usePrevNextButtons(api);

        const scrollPrev = React.useCallback(() => {
            onPrevButtonClick?.();
        }, [onPrevButtonClick]);

        const scrollNext = React.useCallback(() => {
            onNextButtonClick?.();
        }, [onNextButtonClick]);

        const handleKeyDown = React.useCallback(
            (event: React.KeyboardEvent<HTMLDivElement>) => {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    scrollPrev();
                } else if (event.key === "ArrowRight") {
                    event.preventDefault();
                    scrollNext();
                }
            },
            [scrollPrev, scrollNext]
        );

        React.useEffect(() => {
            if (!api || !setApi) {
                return;
            }

            setApi(api);
        }, [api, setApi]);

        return (
            <CarouselContext.Provider
                value={{
                    carouselRef,
                    api: api,
                    opts,
                    orientation:
                        orientation ||
                        (opts?.axis === "y" ? "vertical" : "horizontal"),
                    scrollPrev,
                    scrollNext,
                    canScrollPrev: !prevBtnDisabled,
                    canScrollNext: !nextBtnDisabled,
                }}
            >
                {renderSsrStyles && (
                    <style
                        dangerouslySetInnerHTML={{
                            __html:
                                serverApi
                                    .plugins()
                                    .ssr?.getStyles(
                                        `#${id}`,
                                        ".embla__slide"
                                    ) || "",
                        }}
                    />
                )}
                <div
                    onMouseLeave={() => {
                        api?.plugins().autoplay?.play();
                    }}
                    ref={ref}
                    onKeyDownCapture={handleKeyDown}
                    className={cn("relative", className)}
                    role="region"
                    aria-roledescription="carousel"
                    {...props}
                >
                    {children}
                </div>
            </CarouselContext.Provider>
        );
    }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        classNameParent?: string;
    }
>(({ className, classNameParent, ...props }, ref) => {
    const { carouselRef, orientation, carouselId } = useCarousel();
    return (
        <div
            ref={carouselRef}
            className={cn("!transform-none overflow-hidden", classNameParent)}
        >
            <div
                ref={ref}
                id={carouselId}
                className={cn(
                    "embla__container flex",
                    orientation === "horizontal" ? "flex-row" : "flex-col",
                    className
                )}
                {...props}
            />
        </div>
    );
});
CarouselContent.displayName = "CarouselContent";

const CarouselScrollProgress = ({
    className,
}: React.HTMLAttributes<HTMLDivElement>) => {
    const { api } = useCarousel();
    const [scrollProgress, setScrollProgress] = React.useState(0);

    const onScroll = React.useCallback((emblaApi: EmblaCarouselType) => {
        const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
        setScrollProgress(progress * 100);
    }, []);

    React.useEffect(() => {
        if (!api) return;

        onScroll(api);
        api.on("reinit", onScroll)
            .on("scroll", onScroll)
            .on("slidefocus", onScroll);
    }, [api, onScroll]);

    return (
        <div
            className={cn(
                "relative h-2 w-full self-center overflow-hidden rounded-full bg-bg-sf2",
                className
            )}
        >
            <div
                className="max-w-1/2 absolute -left-full top-0 h-full w-full bg-bg-dark-main"
                style={{ transform: `translate3d(${scrollProgress}%,0px,0px)` }}
            />
        </div>
    );
};

const CarouselItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
        <div
            ref={ref}
            role="group"
            aria-roledescription="slide"
            className={cn(
                "embla__slide min-w-0 shrink-0 grow-0 basis-full",
                orientation === "horizontal" ? "pl-4" : "pt-4",
                className
            )}
            {...props}
        />
    );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button>
>(({ className, variant = "ghost", size = "icon", mode, ...props }, ref) => {
    const { scrollPrev, canScrollPrev, orientation } = useCarousel();
    return (
        <Button
            ref={ref}
            variant={variant}
            size={size}
            mode={mode}
            className={cn("p-0", className)}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
            {...props}
        >
            <span className="size-5">
                {orientation === "vertical" ? (
                    <IconChevonTop />
                ) : (
                    <IconChevonLeft />
                )}
            </span>
            <span className="sr-only">Previous slide</span>
        </Button>
    );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button>
>(({ className, variant = "ghost", size = "icon", mode, ...props }, ref) => {
    const { scrollNext, canScrollNext, orientation } = useCarousel();

    return (
        <Button
            ref={ref}
            variant={variant}
            mode={mode}
            size={size}
            className={cn("p-0", className)}
            disabled={!canScrollNext}
            onClick={scrollNext}
            {...props}
        >
            <span className="size-5">
                {orientation === "vertical" ? (
                    <IconChevonDown />
                ) : (
                    <IconChevonRight />
                )}
            </span>
            <span className="sr-only">Next slide</span>
        </Button>
    );
});
CarouselNext.displayName = "CarouselNext";
type PropType = React.ComponentPropsWithRef<"button"> & {
    isActive?: boolean;
    direction?: number;
};

export const CarouselDotButton: React.FC<PropType> = (props) => {
    const {
        children,
        isActive,
        direction = 1,
        className,
        ...restProps
    } = props;

    return (
        <button
            type="button"
            aria-current={isActive ? "true" : undefined}
            className={cn(
                "flex size-6 flex-shrink-0 touch-manipulation items-center justify-center transition-[width] duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-main",
                isActive ? "w-6 tb:w-5" : "w-4 tb:w-3",
                className
            )}
            {...restProps}
        >
            <div
                data-dot
                className="relative h-[2px] w-full overflow-hidden bg-white-main/30"
            >
                <AnimatePresence custom={direction} initial={false}>
                    {isActive && (
                        <m.div
                            key="active-dot"
                            custom={direction}
                            initial="initial"
                            data-dot-active={isActive}
                            animate="animate"
                            exit="exit"
                            variants={{
                                initial: (dir: number) => ({
                                    x: dir === 1 ? "-100%" : "100%",
                                }),
                                animate: {
                                    x: "0%",
                                    transition: {
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    },
                                },
                                exit: (dir: number) => ({
                                    x: dir === 1 ? "100%" : "-100%",
                                    transition: {
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    },
                                }),
                            }}
                            className="absolute inset-0 bg-bg-main"
                        />
                    )}
                </AnimatePresence>
            </div>
            {children}
        </button>
    );
};

export const CarouselDotGroup = ({ className }: { className?: string }) => {
    const { api } = useCarousel();
    const { selectedIndex, scrollSnaps, direction } = useDotButton(api);

    return (
        <div
            className={cn(
                "absolute -bottom-8 left-1/2 flex -translate-x-1/2 flex-row gap-1",
                className
            )}
        >
            {scrollSnaps &&
                scrollSnaps?.map((_, index) => (
                    <CarouselDotButton
                        key={index}
                        aria-label={`Go to slide ${index + 1}`}
                        onClick={() => {
                            api?.goTo(index);
                        }}
                        isActive={selectedIndex === index}
                        direction={direction}
                    />
                ))}
        </div>
    );
};
export const CarouselDotButtonSkeleton = () => {
    return (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-row gap-1">
            <Skeleton className="h-[2px] w-6 bg-white-main/20" />
            <Skeleton className="h-[2px] w-4 bg-white-main/20" />
            <Skeleton className="h-[2px] w-4 bg-white-main/20" />
            <Skeleton className="h-[2px] w-4 bg-white-main/20" />
        </div>
    );
};

const CarouselScrollbar = ({ className }: { className?: string }) => {
    const scrollbarRef = React.useRef<HTMLDivElement>(null);
    const scrollbarCloneRef = React.useRef<HTMLDivElement>(null);
    const scrollbarTrackRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState<boolean>(false);
    const { api: emblaApi, orientation, opts } = useCarousel();
    const startIndex =
        (opts as Partial<OptionsType> & { startIndex?: number })?.startIndex ??
        2;
    const isLoop = opts?.loop ?? false;
    const scrollSnaps = emblaApi?.snapList() || [];
    const handleTrackClick = React.useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();

            if (
                !emblaApi ||
                event.target === scrollbarRef.current ||
                !scrollSnaps?.length
            )
                return;

            emblaApi.internalEngine().animation.start();

            const { clientX } = event;
            const rect = scrollbarTrackRef.current?.getBoundingClientRect();
            if (!rect) return;

            const percentageFromLeftEdge =
                ((clientX - rect.left) / rect.width) * 100;
            const closestIndex = findClosestIndex(
                scrollSnaps,
                percentageFromLeftEdge
            );

            emblaApi.goTo(closestIndex);
        },
        [emblaApi, scrollSnaps]
    );

    const handleMouseMoveScrollbar = React.useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (!emblaApi || !isDragging || !scrollSnaps) return;

            const track = scrollbarTrackRef.current;
            const scrollbar = scrollbarRef.current;
            if (!track || !scrollbar) return;

            let clientX;
            if (event.type === "touchmove" && event.target === scrollbar) {
                clientX = (event as TouchEvent).touches[0].clientX;
            } else {
                clientX = (event as MouseEvent).clientX;
            }

            const rect = track.getBoundingClientRect();
            const newTranslateX = Math.max(
                0,
                Math.min(
                    track.clientWidth - scrollbar.clientWidth,
                    clientX - rect.left - scrollbar.clientWidth / 2
                )
            );

            scrollbar.style.transform = `translateX(${newTranslateX}px)`;

            const percentageFromLeftEdge =
                (newTranslateX / (track.clientWidth - scrollbar.clientWidth)) *
                100;
            const closestIndex = findClosestIndex(
                scrollSnaps,
                percentageFromLeftEdge
            );

            const maxWidthApiScrollProgressPx =
                emblaApi.internalEngine().limit.length;
            const rangeValueForEmblaEngine =
                ((-1 * percentageFromLeftEdge) / 100) *
                maxWidthApiScrollProgressPx;
            const engine = emblaApi.internalEngine();
            engine.scrollBody.useFriction(0.68);
            engine.animation.stop();
            engine.translate.to(rangeValueForEmblaEngine);
            engine.location.set(rangeValueForEmblaEngine);
            engine.target.set(closestIndex);
        },
        [emblaApi, isDragging, scrollSnaps]
    );

    const translateScrollbar = React.useCallback(
        (newPercent: number) => {
            const track = scrollbarTrackRef.current;
            const scrollbar = scrollbarRef.current;
            const scrollbarClone = scrollbarCloneRef.current;

            if (!track || !scrollbar) {
                return;
            }

            const isHorizontal = orientation === "horizontal";
            const trackSize = isHorizontal
                ? track.clientWidth
                : track.clientHeight;
            const translateProp = isHorizontal ? "translateX" : "translateY";

            if (isLoop) {
                // Loop mode: position thumb based on full track size (no clamping)
                // so it can exit the track bounds. The clone sits one full
                // trackSize behind, entering from the opposite side.
                const translate = (newPercent / 100) * trackSize;
                scrollbar.style.transform = `${translateProp}(${translate}px)`;
                if (scrollbarClone) {
                    scrollbarClone.style.transform = `${translateProp}(${translate - trackSize}px)`;
                }
            } else {
                const newPercentClamped = Math.max(
                    0,
                    Math.min(100, newPercent)
                );
                const scrollbarSize = isHorizontal
                    ? scrollbar.clientWidth
                    : scrollbar.clientHeight;
                const maxTranslate = trackSize - scrollbarSize;
                const translate = (newPercentClamped / 100) * maxTranslate;

                scrollbar.style.transform = isHorizontal
                    ? `translateX(${translate}px)`
                    : `translateY(${translate}px)`;
            }
        },
        [orientation, isLoop]
    );

    const handleMouseUp = React.useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (event.type !== "touchmove") {
                event.preventDefault();
                event.stopPropagation();
            }
            setIsDragging(false);

            window.removeEventListener("mousemove", handleMouseMoveScrollbar);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleMouseMoveScrollbar);
            window.removeEventListener("touchend", handleMouseUp);
        },
        [handleMouseMoveScrollbar]
    );

    const handleMouseDown = React.useCallback(
        (
            event:
                | React.MouseEvent<HTMLDivElement, MouseEvent>
                | React.TouchEvent<HTMLDivElement>
        ) => {
            if (event.type !== "touchmove") {
                event.preventDefault();
                event.stopPropagation();
            }
            setIsDragging(true);

            window.addEventListener("mousemove", handleMouseMoveScrollbar);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleMouseMoveScrollbar);
            window.addEventListener("touchend", handleMouseUp);
        },
        [handleMouseMoveScrollbar, handleMouseUp]
    );

    const onScroll = React.useCallback(
        (emblaApi: EmblaCarouselType) => {
            if (!emblaApi) {
                return;
            }

            translateScrollbar(emblaApi.scrollProgress() * 100);
        },
        [translateScrollbar]
    );

    React.useEffect(() => {
        if (!emblaApi) {
            return;
        }

        onScroll(emblaApi);
        emblaApi.on("reinit", onScroll).on("scroll", onScroll);
    }, [emblaApi, onScroll]);

    React.useEffect(() => {
        if (emblaApi) {
            emblaApi.goTo(startIndex);
        }
    }, [emblaApi, startIndex]);

    const hasNoItems = isEmpty(emblaApi?.snapList());

    const percentOfScrollbar = React.useMemo(() => {
        if (!emblaApi) return 0;

        if (isLoop) {
            const snapCount = emblaApi.snapList().length;
            if (!snapCount) return 0;
            return 100 / snapCount;
        }

        const container = emblaApi.containerNode();
        if (!container) return 0;

        const isHorizontal = orientation === "horizontal";
        const containerSize = isHorizontal
            ? container.clientWidth
            : container.clientHeight;
        const scrollSize = isHorizontal
            ? container.scrollWidth
            : container.scrollHeight;

        return (containerSize / scrollSize) * 100;
    }, [emblaApi, orientation, isLoop, emblaApi?.snapList().length]);

    const thumbClasses = cn(
        "after:contents-[''] absolute top-0 left-0 bg-bg-main after:z-10 after:block after:overflow-hidden after:bg-bg-main",
        orientation === "horizontal"
            ? "h-5 w-0 py-2 after:h-1"
            : "h-0 w-5 px-2 after:w-1"
    );

    const thumbStyle = {
        width:
            orientation === "horizontal"
                ? `${percentOfScrollbar - 0.1}%`
                : "100%",
        height:
            orientation === "vertical"
                ? `${percentOfScrollbar - 0.1}%`
                : "100%",
        cursor: isDragging ? ("grabbing" as const) : ("grab" as const),
    };

    return hasNoItems || !percentOfScrollbar ? null : (
        <div
            className={cn(
                "cursor-pointer",
                orientation === "horizontal" ? "-my-2 py-2" : "-mx-2 px-2",
                className
            )}
            onClick={handleTrackClick}
        >
            <div
                className={cn(
                    "before:contents-[''] relative flex cursor-pointer self-center overflow-hidden bg-bd-main/15",
                    orientation === "horizontal"
                        ? "h-1 w-full items-center before:absolute before:top-1/2 before:h-2 before:w-full before:-translate-y-1/2"
                        : "h-full w-px items-start before:absolute before:left-1/2 before:h-full before:w-2 before:-translate-x-1/2"
                )}
                ref={scrollbarTrackRef}
            >
                {/* Main thumb */}
                <div
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    className={thumbClasses}
                    ref={scrollbarRef}
                    style={thumbStyle}
                />
                {/* Clone thumb for loop wrap-around */}
                {isLoop && (
                    <div
                        className={thumbClasses}
                        ref={scrollbarCloneRef}
                        style={{
                            ...thumbStyle,
                            pointerEvents: "none",
                            transform:
                                orientation === "vertical"
                                    ? "translateY(-100%)"
                                    : "translateX(-100%)",
                        }}
                    />
                )}
            </div>
        </div>
    );
};

CarouselScrollbar.displayName = "CarouselScrollbar";

export {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    CarouselScrollbar,
    CarouselScrollProgress,
    useDotButton,
    type CarouselApi,
};
