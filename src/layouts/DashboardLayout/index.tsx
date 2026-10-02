"use client";

import { Toaster } from "@/components/ui/sonner";
import React, { useEffect, useState } from "react";
import SidebarDashBoard from "./SidebarDashBoard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isSidebarOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isSidebarOpen]);

    return (
        <>
            <main className="min-h-screen flex-1 bg-bg-sf1">
                {/* Mobile/Tablet Header */}
                <div className="sticky top-0 z-40 hidden h-16 w-full items-center border-b border-bd-main bg-bg-main tb:flex">
                    <div className="flex h-full items-center border-r border-bd-main">
                        <Button
                            variant="empty"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className="size-[3.25rem] text-typo-primary tb:size-16"
                            aria-label="Open dashboard navigation"
                            aria-controls="dashboard-navigation"
                            aria-expanded={isSidebarOpen}
                        >
                            <span className="size-4" aria-hidden="true">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="100%"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <path
                                        d="M2.00199 3.5H14"
                                        stroke="currentColor"
                                        strokeWidth="1.3"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M2 8.07143H13.995"
                                        stroke="currentColor"
                                        strokeWidth="1.3"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M2.00194 12.6429H13.995"
                                        stroke="currentColor"
                                        strokeWidth="1.3"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </Button>
                    </div>
                    <span className="ml-4 font-inter text-lg font-medium text-typo-primary mb:text-base">
                        Dashboard
                    </span>
                </div>

                <div className="relative flex h-full min-h-screen min-w-0 flex-row tb:block">
                    {isSidebarOpen ? (
                        <button
                            type="button"
                            className="fixed inset-0 z-40 hidden bg-black/40 backdrop-blur-[1px] tb:block"
                            onClick={() => setIsSidebarOpen(false)}
                            aria-label="Close dashboard navigation"
                        />
                    ) : null}

                    <div
                        id="dashboard-navigation"
                        className={cn(
                            "relative shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none",
                            "tb:fixed tb:left-0 tb:top-0 tb:z-50 tb:h-full tb:w-[20.375rem] tb:max-w-[85vw] tb:overflow-y-auto tb:overscroll-contain tb:bg-bg-dark-main tb:shadow-2xl",
                            isSidebarOpen
                                ? "tb:pointer-events-auto tb:visible tb:translate-x-0"
                                : "tb:pointer-events-none tb:invisible tb:-translate-x-full"
                        )}
                    >
                        <Button
                            variant="empty"
                            size="icon"
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute right-3 top-3 z-10 hidden text-typo-dark-primary tb:flex"
                            aria-label="Close dashboard navigation"
                        >
                            <X className="size-5" aria-hidden="true" />
                        </Button>
                        <SidebarDashBoard />
                    </div>

                    {/* Content area — padded container with rounded panel */}
                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex min-h-[calc(100vh-24px)] flex-1 flex-col overflow-x-clip rounded-[10px] bg-bg-main tb:min-h-[calc(100vh-64px)] tb:rounded-none">
                            {children}
                        </div>
                    </div>
                    <Toaster />
                </div>
            </main>
        </>
    );
}
