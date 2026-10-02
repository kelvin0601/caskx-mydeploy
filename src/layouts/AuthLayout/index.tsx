"use client";

import ImagePreload from "@/components/shared/image-preload";
import { Toaster } from "@/components/ui/sonner";
import useClearCacheMutation from "@/hooks/useClearCacheMutation";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    useClearCacheMutation();
    const currentYear = new Date().getFullYear();
    return (
        <div className="sticky min-h-screen w-full bg-bg-main">
            <div className="container relative z-10 grid h-full min-h-screen w-full grid-cols-16 tb:grid-cols-12 mb:grid-cols-4">
                <div className="col-start-5 -col-end-5 mx-auto flex min-h-screen w-full flex-col pb-[3.75rem] pt-[3.75rem] dk:max-w-[38.75rem] tb:col-start-3 tb:-col-end-3 tb:pb-10 tb:pt-10 mb:col-start-1 mb:-col-end-1 mb:pb-4 mb:pt-6">
                    {/* Logo in flow */}
                    <div className="mb-10 flex justify-center tb:mb-[6.25rem]">
                        <ImagePreload
                            src={"/images/logo_full_dark.png"}
                            alt="Logo"
                            width={200}
                            height={100}
                            className="h-4 w-auto"
                            priority
                        />
                    </div>

                    {/* Form Content */}
                    <div className="flex flex-1 flex-col justify-center">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto select-none pt-10 text-center font-inter text-sm text-typo-soft tb:pt-[6.25rem]">
                        © {currentYear} Cask Exchange. All rights reserved.
                    </div>
                </div>
            </div>
            <Toaster />
        </div>
    );
}
