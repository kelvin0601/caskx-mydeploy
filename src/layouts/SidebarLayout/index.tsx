import React from "react";
import { cn } from "@/lib/utils";

type SidebarLayoutProps = {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    containerClassName?: string;
    sidebarContainerClassName?: string;
    contentContainerClassName?: string;
    relative?: boolean;
};

export default function BaseSidebarLayout({
    children,
    sidebar,
    containerClassName,
    sidebarContainerClassName,
    contentContainerClassName,
    relative = false,
}: SidebarLayoutProps) {
    return (
        <div
            className={cn(
                "flex min-h-screen flex-col bg-bg-main tb:min-h-0",
                relative && "relative"
            )}
        >
            <div className={cn("container relative", containerClassName)}>
                <div className="grid h-full min-h-[calc(100vh-var(--height-header))] grid-cols-16 bg-bg-main tb:grid-cols-1">
                    <div
                        className={cn(
                            "z-20 col-span-3 transition-all duration-100 dk:-ml-[var(--padding-container)] tb:sticky tb:top-[var(--height-header)] tb:z-20 tb:col-span-1 header-hidden:tb:top-0",
                            sidebarContainerClassName
                        )}
                    >
                        {sidebar}
                    </div>
                    <div
                        className={cn(
                            "col-span-13 pb-10 pl-6 pt-10 dk:pr-4 tb:col-span-1 tb:min-h-[calc(100vh-var(--height-header))] tb:pb-8 tb:pl-0 tb:pt-8 mb:pb-6 mb:pt-6",
                            contentContainerClassName
                        )}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
