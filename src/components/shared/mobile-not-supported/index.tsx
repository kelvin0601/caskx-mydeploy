"use client";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import ImagePlaceholder from "../image-placeholder";
import ImagePreload from "../image-preload";

type MobileNotSupportedProps = {
    className?: string;
};

export default function MobileNotSupported({
    className,
}: MobileNotSupportedProps) {
    return (
        <div
            className={cn(
                "relative flex min-h-screen flex-col items-center justify-center bg-bg-main px-4 py-8",
                className
            )}
        >
            <div className="flex h-full flex-col items-center">
                <ImagePreload
                    width={100}
                    height={100}
                    src="/icons/logo.svg"
                    className="mb-6 h-[3.75rem] w-[3.75rem]"
                />

                <h1 className="mb-2 text-center text-lg font-bold text-typo-primary">
                    Desktop Version Recommended
                </h1>

                <p className="max-w-md text-center text-sm">
                    We&apos;re currently updating our mobile site to make it
                    even better. In the meantime, please check us out on your
                    desktop.
                </p>
            </div>
            <p className="absolute inset-x-0 bottom-6 whitespace-nowrap text-center text-sm text-typo-disable">
                Copyright © {APP_NAME.toUpperCase().replace(/ /g, "")}{" "}
                PLATFORM, {new Date().getFullYear()}
            </p>
        </div>
    );
}
