"use client";

import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import ImagePlaceholder from "../image-placeholder";
import ImagePreload from "../image-preload";
import LinkCustom from "../link-custom";

export default function SplashScreen() {
    const isSmallScreen = useMediaQuery({ query: "(max-width: 1024px)" });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, []);
    return (
        <div
            className={cn(
                "sticky top-0 z-20 h-screen overflow-hidden bg-bg-dark-main transition-all duration-300 ease-in-out tb:static tb:h-auto",
                !isLoading && isSmallScreen && "pointer-events-none opacity-0"
            )}
        >
            <div
                className={cn(
                    "flex-start relative z-20 h-full flex-col transition-all duration-300",
                    isSmallScreen && !isLoading && "scale-110"
                )}
            >
                <LinkCustom href={ROUTE_PUBLIC.HOME}>
                    <div className="mt-[8.6vh] h-5 w-[13.875rem] overflow-hidden">
                        <ImagePreload
                            alt="Logo"
                            src={"/images/logo-full-fx.png"}
                            width={440}
                            height={40}
                            priority
                            fetchPriority="high"
                        />
                    </div>
                </LinkCustom>
                <div className="my-auto pb-[3.7vh] text-center">
                    <div className="ff-decor text-7xl text-typo-dark-primary opacity-30 tb:text-[4rem] mb:text-[2rem]">
                        for
                    </div>
                    <div className="ff-decor text-mask text-[7.5rem] leading-none text-typo-dark-primary tb:text-[6.25rem] mb:text-[3.375rem]">
                        Investment
                    </div>
                </div>
                <div className="w-full max-w-[37.625rem] tb:max-w-[34.75rem]">
                    <ImagePlaceholder
                        alt="Barrel"
                        src={"/images/barrel.png"}
                        width={600}
                        height={327}
                        priority
                        fetchPriority="high"
                        className="aspect-[600/327]"
                    />
                </div>
            </div>
            {isLoading && isSmallScreen && (
                <div className="absolute left-1/2 top-2/3 z-20 -translate-x-1/2 -translate-y-1/2">
                    <div className="border-white h-12 w-12 animate-spin rounded-full border-[0.25rem] border-b-transparent mb:h-10 mb:w-10 mb:border-2"></div>
                </div>
            )}
            <div className="absolute inset-0 z-10">
                <ImagePreload
                    alt="Background"
                    src={"/images/splash-bg.svg"}
                    style={{ objectFit: "cover" }}
                    className="absolute inset-0 z-10"
                    width={864}
                    priority
                    fetchPriority="high"
                    height={1080}
                />
            </div>
        </div>
    );
}
