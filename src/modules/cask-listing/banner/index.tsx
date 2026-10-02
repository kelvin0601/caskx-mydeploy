"use client";

import { Skeleton } from "@/components/ui/skeleton";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { AUTH_KEYS } from "@/lib/constants/key";

export default function Banner() {
    const { status } = useGetStateQuery({
        key: [AUTH_KEYS.WHOAMI],
    });

    if (status === "pending") {
        return <BannerCardSkeleton />;
    }
    return (
        <div className="w-full bg-bg-sf1 py-10 tb:py-8 mb:py-6">
            <div className="container mx-auto grid grid-cols-12 tb:grid-cols-6 mb:grid-cols-4">
                <div className="col-start-1 -col-end-1 tb:col-start-1 tb:-col-end-1">
                    <h1 className="mb-2 font-reckless text-3xl font-medium tracking-tighter text-typo-primary tb:text-3xl mb:text-2xl">
                        Marketplace
                    </h1>
                    <div className="text-base text-typo-soft mb:text-sm">
                        Top products from distilleries around the world
                    </div>
                </div>
            </div>
        </div>
    );
}

const BannerCardSkeleton = () => {
    return (
        <div className="w-full bg-bg-sf1 py-10 tb:py-8 mb:py-6">
            <div className="container mx-auto grid grid-cols-12 tb:grid-cols-6 mb:grid-cols-4">
                <div className="col-start-1 -col-end-1 flex flex-col gap-2 tb:col-start-1 tb:-col-end-1">
                    <Skeleton className="h-2 w-[11.5625rem] bg-bg-sf2" />
                    <Skeleton className="h-2 w-[15.875rem] bg-bg-sf2" />
                </div>
            </div>
        </div>
    );
};
