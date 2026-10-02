"use client";

import CaskInfoStats from "@/components/shared/cask-info-stats";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import type { cask } from "@/types/cask";
import Image from "next/image";

export type CaskInfoDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    caskData?: cask.TCask;
};

export default function CaskInfoDrawer({
    open,
    onOpenChange,
    caskData,
}: CaskInfoDrawerProps) {
    if (!caskData) return null;

    const caskName = caskData.master?.name || caskData.name || "Cask";

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            direction="bottom"
            repositionInputs={false}
        >
            <DrawerContent className="rounded-none border-x-0 border-b-0 border-t-bd-main bg-bg-main p-0 tb:h-[25.5rem] tb:max-h-[calc(100dvh-3.25rem)] mb:h-dvh mb:max-h-none [&_[data-drawer-close]>div]:!size-4 [&_[data-drawer-close]>div]:!text-icon-main [&_[data-drawer-close]]:right-5 [&_[data-drawer-close]]:top-3 [&_[data-drawer-close]]:flex [&_[data-drawer-close]]:size-10 [&_[data-drawer-close]]:items-center [&_[data-drawer-close]]:justify-center [&_[data-drawer-close]]:p-0 mb:[&_[data-drawer-close]]:right-4 mb:[&_[data-drawer-close]]:top-[0.625rem]">
                <div className="flex h-16 shrink-0 items-center border-b border-bd-main px-5 mb:h-[3.75rem] mb:px-4">
                    <DrawerTitle className="mb-0 font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                        Cask Info
                    </DrawerTitle>
                </div>

                <div className="flex min-h-0 flex-1 items-start mb:flex-col mb:overflow-y-auto">
                    <div className="flex size-[21.5rem] shrink-0 p-5 mb:h-auto mb:w-full mb:p-4">
                        <div className="relative aspect-square size-full overflow-hidden bg-bg-dark-main mb:mx-auto mb:max-w-none">
                            {caskData.imageUrl ? (
                                <Image
                                    src={caskData.imageUrl}
                                    alt={`${caskName} cask`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 767px) calc(100vw - 2rem), 19rem"
                                />
                            ) : null}
                        </div>
                    </div>

                    <div className="flex h-[21.5rem] min-w-0 flex-1 flex-col gap-4 py-5 pr-5 mb:h-auto mb:w-full mb:px-4 mb:pb-4 mb:pt-0">
                        <h2 className="  font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                            {caskName}
                        </h2>
                        <CaskInfoStats caskData={caskData} />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
