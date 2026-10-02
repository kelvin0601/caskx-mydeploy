import React, { memo } from "react";
import DataChip from "@/components/shared/data-chip";
import IconChevonRightDouble from "@/components/shared/icons/icon-chevon-right-double";
import IconDrink from "@/components/shared/icons/icon-drink";
import IconInfoCircleLine from "@/components/shared/icons/icon-info-circle-line";
import IconTastingNote from "@/components/shared/icons/icon-tasting-note";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import ProfileSliderBar from "../profile-slider-bar";
import IconBarrel from "@/components/shared/icons/icon-barrel";

type GeneralInfoProps = {
    isOpenSidebar: boolean;
    toggleSidebar: () => void;
    isCaskLoading: boolean;
    rla: string | null;
    abv: string | null;
    ola: string | null;
    bottles: string | null;
    bottleVolume: string | null;
    summary?: string;
    tastingNotes?: string | null;
};

function GeneralInfo({
    isOpenSidebar,
    toggleSidebar,
    isCaskLoading,
    rla,
    abv,
    ola,
    bottles,
    bottleVolume,
    tastingNotes,
    summary,
}: GeneralInfoProps) {
    return (
        <div className="sticky top-[calc(var(--height-header)+2.5rem)] flex h-max flex-1 flex-col gap-4 pb-6 pt-4 contain-paint tb:pb-0 tb:pt-0">
            <div className="flex items-center justify-between gap-4 tb:hidden">
                <h2 className="font-reckless text-xl font-medium leading-none text-typo-primary">
                    General Information
                </h2>
                <Button
                    className={cn("h-10 gap-2", isOpenSidebar ? "size-10" : "")}
                    variant="outline-text"
                    onClick={toggleSidebar}
                >
                    {isOpenSidebar ? "" : "View Market Data"}
                    <IconChevonRightDouble
                        className={cn(
                            "h-3.5 w-3.5 rotate-180 transition-all",
                            isOpenSidebar ? "rotate-0" : ""
                        )}
                    />
                </Button>
            </div>

            <Accordion
                type="multiple"
                defaultValue={["about", "specs", "tasting", "profile"]}
                className="flex w-full flex-col gap-6 tb:gap-5 mb:gap-4"
            >
                {/* About */}
                {((!isCaskLoading && summary) || isCaskLoading) && (
                    <AccordionItem
                        value="about"
                        className="rounded-none border border-bd-main bg-bg-main p-6 tb:p-4"
                    >
                        <AccordionTrigger
                            className="select-none p-0"
                            classNameChevron="text-typo-note"
                        >
                            <div className="flex items-center gap-2 text-typo-primary">
                                <IconInfoCircleLine className="h-5 w-5 shrink-0" />
                                <span className="text-lg font-semibold tb:text-base">
                                    About this Vintage
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent
                            className="pb-0 pt-6 tb:pt-4"
                            aria-busy={isCaskLoading}
                        >
                            {isCaskLoading ? (
                                <AboutVintageSkeleton />
                            ) : (
                                <div className="text-sm text-typo-sub">
                                    {summary}
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Specifications */}
                <AccordionItem
                    value="specs"
                    className="rounded-none border border-bd-main bg-bg-main p-6 tb:p-4"
                >
                    <AccordionTrigger
                        className="select-none p-0"
                        classNameChevron="text-typo-note"
                    >
                        <div className="flex items-center gap-2 text-typo-primary">
                            <span className="size-5">
                                <IconBarrel />
                            </span>
                            <span className="text-lg font-semibold tb:text-base">
                                Specifications
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent
                        className="pb-0 pt-6 tb:pt-4"
                        aria-busy={isCaskLoading}
                    >
                        {isCaskLoading ? (
                            <div className="grid grid-cols-2 !gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <DataChipSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 !gap-2">
                                <DataChip
                                    label="RLA"
                                    value={rla}
                                    className="gap-1"
                                />
                                <DataChip
                                    label="ABV"
                                    value={abv}
                                    className="gap-1"
                                />
                                <DataChip
                                    label="OLA"
                                    value={ola}
                                    className="gap-1"
                                />
                                <DataChip
                                    label="Bottles"
                                    value={bottles}
                                    className="gap-1"
                                />
                                <DataChip
                                    label="Bottle Volume"
                                    value={bottleVolume}
                                    className="gap-1"
                                />
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                {/* Tasting Notes */}
                {(tastingNotes || isCaskLoading) && (
                    <AccordionItem
                        value="tasting"
                        className="rounded-none border border-bd-main bg-bg-main p-6 tb:p-4"
                    >
                        <AccordionTrigger
                            className="select-none p-0"
                            classNameChevron="text-typo-note"
                        >
                            <div className="flex items-center gap-2 text-typo-primary">
                                <IconTastingNote className="h-5 w-5 shrink-0" />
                                <span className="text-lg font-semibold tb:text-base">
                                    Tasting Notes
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent
                            className="pb-0 pt-6 tb:pt-4"
                            aria-busy={isCaskLoading}
                        >
                            {isCaskLoading ? (
                                <TastingNotesSkeleton />
                            ) : tastingNotes ? (
                                <p className="whitespace-pre-wrap text-sm text-typo-sub">
                                    {tastingNotes}
                                </p>
                            ) : null}
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Profile */}
                <AccordionItem
                    value="profile"
                    className="rounded-none border border-bd-main bg-bg-main p-6 tb:p-4"
                >
                    <AccordionTrigger
                        className="select-none p-0"
                        classNameChevron="text-typo-note"
                    >
                        <div className="flex items-center gap-2 text-typo-primary">
                            <IconDrink className="h-5 w-5 shrink-0" />
                            <span className="text-lg font-semibold tb:text-base">
                                Profile
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent
                        className="pb-0 pt-6 tb:pt-4"
                        aria-busy={isCaskLoading}
                    >
                        {isCaskLoading ? (
                            <ProfileSkeleton />
                        ) : (
                            <div className="flex flex-col gap-3">
                                <ProfileSliderBar
                                    leftLabel="Dry"
                                    rightLabel="Sweet"
                                    position={2}
                                />
                                <ProfileSliderBar
                                    leftLabel="Light"
                                    rightLabel="Bold"
                                    position={3}
                                />
                                <ProfileSliderBar
                                    leftLabel="No oak"
                                    rightLabel="Oak"
                                    position={5}
                                />
                                <ProfileSliderBar
                                    leftLabel="Smooth"
                                    rightLabel="Tannic"
                                    position={4}
                                />
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}

export default memo(GeneralInfo);

function DataChipSkeleton() {
    return (
        <div
            className="flex h-14 flex-col gap-2 bg-bg-sf4 p-3"
            aria-hidden="true"
        >
            <Skeleton className="h-2.5 w-12 bg-bd-main/70" />
            <Skeleton className="h-3.5 w-20 max-w-full bg-bd-main/70" />
        </div>
    );
}

function AboutVintageSkeleton() {
    return (
        <div className="flex min-h-20 flex-col justify-start gap-2">
            <Skeleton className="h-3.5 w-full bg-bd-main/70" />
            <Skeleton className="h-3.5 w-11/12 bg-bd-main/70" />
            <Skeleton className="h-3.5 w-3/5 bg-bd-main/70" />
        </div>
    );
}

function TastingNotesSkeleton() {
    return (
        <div className="flex flex-col gap-2" aria-hidden="true">
            <Skeleton className="h-3 w-full bg-bd-main/70" />
            <Skeleton className="h-3 w-4/5 bg-bd-main/70" />
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="flex flex-col gap-3" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-3">
                    <Skeleton className="h-3 w-[4.375rem] shrink-0 bg-bd-main/70" />
                    <div className="flex flex-1 items-center gap-1">
                        {Array.from({ length: 7 }).map((_, segmentIndex) => (
                            <Skeleton
                                key={segmentIndex}
                                className="h-1.5 flex-1 bg-bd-main/70"
                            />
                        ))}
                    </div>
                    <Skeleton className="h-3 w-[4.375rem] shrink-0 bg-bd-main/70" />
                </div>
            ))}
        </div>
    );
}
