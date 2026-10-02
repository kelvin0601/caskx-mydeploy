"use client";

import Breadcrumb from "@/components/shared/breadcrumb";
import CaskInfoDrawer from "@/components/shared/cask-info-drawer";
import CaskInfoStats from "@/components/shared/cask-info-stats";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import ImagePreload from "@/components/shared/image-preload";
import LinkCustom from "@/components/shared/link-custom";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { cask } from "@/types";
import React, { useState } from "react";

export type TOrderDetailLayoutProps = {
    breadcrumbType: "offer" | "listing";
    caskName: string;
    distilleryName?: string;
    statusBadge: React.ReactNode;
    caskImage?: string;
    caskDetail?: cask.TCask;
    sidebarExtra?: React.ReactNode;
    tabletBottom?: React.ReactNode;
    children: React.ReactNode;
};

export function DetailHeader({
    caskName,
    breadcrumbType,
}: {
    caskName: string;
    breadcrumbType: "offer" | "listing";
}) {
    const breadcrumbItems = [
        { label: "Home", href: ROUTE_PUBLIC.HOME },
        { label: "My Trading", href: ROUTE_PUBLIC.PROFILE },
        {
            label: breadcrumbType === "offer" ? "Offer" : "Listing",
            href:
                breadcrumbType === "offer"
                    ? ROUTE_PUBLIC.PROFILE_OFFER
                    : ROUTE_PUBLIC.PROFILE_LISTINGS,
        },
        { label: caskName },
    ];

    return (
        <header className="h-[3.8125rem] border-b border-bd-main bg-bg-main j-tb:h-[3.3125rem] mb:h-[2.8125rem]">
            <div className="container relative mx-auto flex h-full items-center !px-0">
                <Breadcrumb
                    items={breadcrumbItems}
                    className="px-6 tb:px-5 mb:px-4"
                />
                <div className="absolute left-1/2 flex -translate-x-1/2 items-center tb:hidden">
                    <LinkCustom
                        href={ROUTE_PUBLIC.HOME}
                        className="block h-4 w-[11.0625rem] flex-none overflow-hidden"
                    >
                        <ImagePreload
                            alt="Cask Exchange Logo"
                            src="/images/logo_full_dark.png"
                            width={440}
                            height={40}
                            className="img-w"
                        />
                    </LinkCustom>
                </div>
            </div>
        </header>
    );
}

export function DataCell({
    label,
    value,
    tabletLabel,
    tabletValue,
}: {
    label: string;
    value: React.ReactNode;
    tabletLabel?: string;
    tabletValue?: string;
}) {
    return (
        <div className="flex h-[3.8125rem] min-w-0 flex-col justify-center gap-1 bg-bg-sf4 px-3">
            <span className="truncate text-xs leading-none text-typo-note">
                {tabletLabel ? (
                    <>
                        <span className="tb:hidden">{label}</span>
                        <span className="hidden tb:inline">{tabletLabel}</span>
                    </>
                ) : (
                    label
                )}
            </span>
            <span className="truncate text-sm font-semibold text-typo-primary">
                {tabletValue ? (
                    <>
                        <span className="tb:hidden">{value}</span>
                        <span className="hidden tb:inline">{tabletValue}</span>
                    </>
                ) : (
                    value
                )}
            </span>
        </div>
    );
}

export function DetailSection({
    title,
    children,
    className,
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                "border-b border-bd-main pb-8",
                "j-tb:pb-6",
                "mb:relative mb:border-b-0 mb:pb-6 mb:after:absolute mb:after:inset-x-0 mb:after:bottom-0 mb:after:h-px mb:after:bg-bd-main",
                className
            )}
        >
            <h2 className="mb-4 text-lg font-semibold text-typo-primary tb:text-base tb:leading-[1.2]">
                {title}
            </h2>
            {children}
        </section>
    );
}

export function OrderDetailSkeleton() {
    return (
        <div className="flex w-full flex-1 flex-col bg-bg-main">
            <Skeleton className="h-[3.8125rem] w-full bg-bg-sf2 j-tb:h-[3.3125rem] mb:h-[2.8125rem]" />
            <div className="container mx-auto grid flex-1 grid-cols-[minmax(0,1297fr)_minmax(0,431fr)] !gap-0 dk:!px-0 tb:grid-cols-1">
                <div className="relative flex flex-col gap-8 p-6 after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-bd-main tb:px-0 tb:after:hidden j-tb:pb-5 j-tb:pt-8 mb:gap-6 mb:px-0 mb:pb-6 mb:pt-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex flex-col gap-4 border-b border-bd-main pb-8 last:border-b-0"
                        >
                            <Skeleton className="h-5 w-48 bg-bg-sf2" />
                            <div className="grid grid-cols-3 !gap-2 mb:grid-cols-2">
                                {Array.from({
                                    length: index === 2 ? 3 : 6,
                                }).map((__, cell) => (
                                    <Skeleton
                                        key={cell}
                                        className="h-[3.8125rem] bg-bg-sf2"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <Skeleton className="m-6 aspect-square bg-bg-sf2 tb:hidden" />
            </div>
        </div>
    );
}

export default function OrderDetailLayout({
    breadcrumbType,
    caskName,
    distilleryName,
    statusBadge,
    caskImage,
    caskDetail,
    sidebarExtra,
    tabletBottom,
    children,
}: TOrderDetailLayoutProps) {
    const [isCaskInfoOpen, setIsCaskInfoOpen] = useState(false);

    return (
        <div className="flex w-full flex-1 flex-col bg-bg-main">
            <DetailHeader caskName={caskName} breadcrumbType={breadcrumbType} />
            <div className="container mx-auto grid flex-1 grid-cols-[minmax(0,1297fr)_minmax(0,431fr)] !gap-0 dk:!px-0 tb:grid-cols-1">
                <main className="relative min-w-0 px-6 pb-6 pt-6 after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-bd-main tb:px-0 tb:after:hidden j-tb:pb-0 j-tb:pt-8 mb:pb-0 mb:pt-6">
                    <div className="flex min-h-[3.25rem] items-start justify-between gap-6 j-tb:mb-6 j-tb:min-h-5 j-tb:items-center mb:mb-6 mb:min-h-[2.625rem] mb:flex-col mb:gap-2">
                        <div className="flex min-w-0 items-start gap-2 mb:w-full">
                            <h1 className="min-w-0 truncate font-reckless text-xl font-medium leading-none text-typo-primary tb:text-lg j-tb:text-xl mb:!leading-5">
                                {caskName}
                                {distilleryName ? (
                                    <span className="tb:hidden">
                                        {" "}
                                        · {distilleryName}
                                    </span>
                                ) : null}
                            </h1>
                            {statusBadge}
                        </div>
                        <div className="hidden shrink-0 tb:block">
                            <Button
                                variant="link"
                                disabled={!caskDetail}
                                onClick={() => setIsCaskInfoOpen(true)}
                                className="h-auto p-0 text-sm font-medium leading-none focus-visible:ring-1 focus-visible:ring-bd-brown-lighter mb:!h-3.5"
                            >
                                View Cask info
                            </Button>
                        </div>
                    </div>

                    {children}

                    {tabletBottom}
                </main>

                <aside className="sticky top-0 flex h-auto max-h-[90vh] min-h-0 min-w-0 flex-col self-start overflow-hidden tb:hidden">
                    <ScrollArea className="mr-0 min-h-0 flex-1 pr-0 tb:hidden [&>div[data-scroll-inner]]:h-auto">
                        <div className="flex h-max flex-col">
                            <div className="p-6">
                                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-bg-dark-main">
                                    <div className="absolute inset-0 z-0">
                                        <ImagePlaceholder
                                            src="/images/bg-cask-detail.jpg"
                                            alt=""
                                            width={764}
                                            height={764}
                                            loading="eager"
                                            className="h-full w-full opacity-15 [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
                                        />
                                    </div>
                                    <div className="relative z-10 h-[16.25rem] w-[16.25rem] overflow-hidden">
                                        <ImagePlaceholder
                                            src={caskImage}
                                            alt={`${caskName} cask`}
                                            width={520}
                                            height={520}
                                            loading="eager"
                                            className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                            <Accordion
                                type="single"
                                collapsible
                                defaultValue="cask-details"
                                className="w-full"
                            >
                                <AccordionItem
                                    value="cask-details"
                                    className="border-none"
                                >
                                    <AccordionTrigger
                                        className="h-11 items-start px-6 py-0 pb-6 text-left"
                                        classNameChevron="size-5"
                                    >
                                        <h2 className="truncate font-reckless text-xl font-medium leading-5 text-typo-primary">
                                            {caskName}
                                        </h2>
                                    </AccordionTrigger>
                                    <AccordionContent
                                        containerClassName="px-6"
                                        className="pb-6"
                                    >
                                        <CaskInfoStats caskData={caskDetail} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </ScrollArea>
                    {sidebarExtra}
                </aside>
            </div>

            <CaskInfoDrawer
                open={isCaskInfoOpen}
                onOpenChange={setIsCaskInfoOpen}
                caskData={caskDetail}
            />
        </div>
    );
}
