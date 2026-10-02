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
        <div className="container flex flex-col gap-2 border-b border-bd-main px-10 py-10 tb:py-8 mb:py-6">
            <h1 className="font-reckless text-3xl font-medium leading-none text-typo-primary tb:text-2xl mb:text-xl">
                Distilleries
            </h1>
            <p className="font-inter text-base font-normal text-typo-soft mb:text-sm">
                Explore distilleries and discover available cask investments.
            </p>
        </div>
    );
}

const BannerCardSkeleton = () => {
    return (
        <div className="container flex flex-col gap-2 border-b border-bd-main px-10 py-10 tb:py-8 mb:py-6">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-[11.5625rem] bg-bg-sf2" />
                <Skeleton className="h-4 w-[15.875rem] bg-bg-sf2" />
            </div>
        </div>
    );
};
