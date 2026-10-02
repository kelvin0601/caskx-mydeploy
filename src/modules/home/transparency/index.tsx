"use client";

import HeadingContent, {
    HeadingContentSkeleton,
} from "@/components/shared/heading";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselScrollbar,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

const CONTENT_TRANSPARENCY = [
    {
        title: "Cask Exchange verified",
        content:
            "Cask Exchange Verified is our exclusive certification, ensuring that each cask undergoes a thorough inspection every time.",
        icon: () => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 33 33"
                fill="none"
            >
                <path
                    d="M12.5003 16.5655L15.167 19.2322L21.167 13.2322M10.2787 5.6571C11.3505 5.57158 12.3679 5.15012 13.1863 4.45274C15.096 2.82532 17.9047 2.82532 19.8144 4.45274C20.6327 5.15012 21.6502 5.57158 22.722 5.6571C25.2231 5.85669 27.2091 7.84277 27.4087 10.3439C27.4943 11.4156 27.9157 12.4331 28.6131 13.2515C30.2405 15.1611 30.2405 17.9699 28.6131 19.8796C27.9157 20.6979 27.4943 21.7154 27.4087 22.7872C27.2091 25.2883 25.2231 27.2743 22.722 27.4739C21.6502 27.5594 20.6327 27.9809 19.8144 28.6783C17.9047 30.3057 15.096 30.3057 13.1863 28.6783C12.3679 27.9809 11.3505 27.5594 10.2787 27.4739C7.77759 27.2743 5.79151 25.2883 5.59192 22.7872C5.50639 21.7154 5.08494 20.6979 4.38755 19.8796C2.76014 17.9699 2.76014 15.1611 4.38755 13.2515C5.08494 12.4331 5.50639 11.4156 5.59192 10.3439C5.79151 7.84277 7.77759 5.85669 10.2787 5.6571Z"
                    stroke="#22262A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        title: "Secure & transparent transactions",
        content:
            "Our escrow-backed system ensures payments are protected until ownership transfer is complete.",
        icon: () => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 33 33"
                fill="none"
            >
                <mask
                    id="mask0_1381_558"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    width="100%"
                    y="0"
                    height="33"
                >
                    <path
                        d="M0.833496 0.56543H32.8335V32.5654H0.833496V0.56543Z"
                        fill="white"
                    />
                </mask>
                <g mask="url(#mask0_1381_558)">
                    <path
                        d="M4.29882 7.76555C4.76551 8.23223 5.43216 8.56555 6.16551 8.56555C7.63216 8.56555 8.83216 7.36555 8.83216 5.89889C8.83216 5.16555 8.49882 4.49889 8.03216 4.03223M4.29882 7.76555C3.76551 7.29889 3.49882 6.63223 3.49882 5.89889C3.49882 4.43223 4.69882 3.23223 6.16551 3.23223C6.89882 3.23223 7.56551 3.49889 8.03216 4.03223M4.29882 7.76555C0.632163 13.0322 0.632163 20.0989 4.29882 25.3656M8.03216 4.03223C13.2988 0.365559 20.3655 0.365559 25.6322 4.03223M4.29882 25.3656C4.76551 24.8989 5.43216 24.5655 6.16551 24.5655C7.63216 24.5655 8.83216 25.7656 8.83216 27.2322C8.83216 27.9655 8.49882 28.6321 8.03216 29.0988M4.29882 25.3656C3.76551 25.8321 3.49882 26.4989 3.49882 27.2322C3.49882 28.6988 4.69882 29.8988 6.16551 29.8988C6.89882 29.8988 7.56551 29.6322 8.03216 29.0988M25.6322 4.03223C25.1655 4.49889 24.8322 5.16555 24.8322 5.89889C24.8322 7.36555 26.0322 8.56555 27.4988 8.56555C28.2321 8.56555 28.8989 8.23223 29.3654 7.76555M25.6322 4.03223C26.0989 3.49889 26.7655 3.23223 27.4988 3.23223C28.9654 3.23223 30.1654 4.43223 30.1654 5.89889C30.1654 6.63223 29.8988 7.29889 29.3654 7.76555M8.03216 29.0988C13.2988 32.7655 20.3655 32.7655 25.6322 29.0988M29.3654 7.76555C33.0321 13.0322 33.0321 20.0989 29.3654 25.3656M25.6322 29.0988C25.1655 28.6321 24.8322 27.9655 24.8322 27.2322C24.8322 25.7656 26.0322 24.5655 27.4988 24.5655C28.2321 24.5655 28.8989 24.8989 29.3654 25.3656M25.6322 29.0988C26.0989 29.6322 26.7655 29.8988 27.4988 29.8988C28.9654 29.8988 30.1654 28.6988 30.1654 27.2322C30.1654 26.4989 29.8321 25.8321 29.3654 25.3656M20.1655 14.5655V11.8989C20.1655 10.0322 18.6988 8.56555 16.8322 8.56555C14.9655 8.56555 13.4988 10.0322 13.4988 11.8989V14.5655M20.1655 14.5655H13.4988M20.1655 14.5655H22.1655V23.2322H11.4988V14.5655H13.4988M16.8322 17.2322V20.5655"
                        stroke="#22262A"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                </g>
            </svg>
        ),
    },
    {
        title: "Provenance & authenticity Guaranteed",
        content:
            "We provide detailed origin records and authentication for every cask, ensuring its history and value are fully verified.",
        icon: () => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 33 33"
                fill="none"
            >
                <path
                    d="M29.4997 16.5654H24.1663L20.1663 28.5654L12.1663 4.56543L8.16634 16.5654H2.83301"
                    stroke="#22262A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
];
export default function Transparency() {
    return (
        <div className="mb-20 flex flex-col tb:mb-10 mb:mb-6">
            <HeadingContent className="mb-12 mb:mb-4">
                Ensuring trust & transparency in cask investments
            </HeadingContent>
            <Carousel
                opts={{
                    align: "start",
                    dragFree: false,
                }}
            >
                <CarouselContent
                    className="-ml-4"
                    classNameParent="tb:overflow-visible"
                >
                    {CONTENT_TRANSPARENCY.map((item, index) => (
                        <CarouselItem
                            className="basis-1/3 pl-4 tb:basis-2/5 mb:basis-[82%] mb:pl-3"
                            key={index}
                        >
                            <div className="h-full rounded-lg bg-bg-sf1">
                                <div className="flex flex-col gap-8 p-8 tb:p-6 mb:gap-4 mb:p-3">
                                    <div className="w-max rounded-[0.3125rem] bg-brand p-[0.875rem] mb:p-2">
                                        <div className="flex-center flex h-8 w-8 [&_svg]:text-typo-primary">
                                            {item.icon()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="mb-4 text-lg font-medium text-typo-primary mb:mb-2 mb:text-base">
                                            {item.title}
                                        </div>
                                        <div className="text-base text-typo-note mb:text-sm">
                                            {item.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}

export function TransparencySkeleton() {
    return (
        <div className="mb-[9.4375rem] flex w-full flex-col gap-12">
            <HeadingContentSkeleton />
            <div className="flex flex-row gap-10">
                {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton
                        className="h-60 flex-1 rounded-lg p-8"
                        key={index}
                    >
                        <Skeleton className="w-15 h-15 mb-8 bg-bg-sf2" />
                        <Skeleton className="mb-4 h-2 w-2/3 bg-bg-sf2" />
                        <Skeleton className="mb-2 h-2 w-[60%] bg-bg-sf2" />
                        <Skeleton className="mb-2 h-2 w-[55%] bg-bg-sf2" />
                        <Skeleton className="mb-2 h-2 w-[50%] bg-bg-sf2" />
                    </Skeleton>
                ))}
            </div>
        </div>
    );
}
