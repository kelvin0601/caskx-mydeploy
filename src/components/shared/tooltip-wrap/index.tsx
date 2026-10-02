import React, { useEffect, useRef, useState } from "react";
import CustomTooltip from "../tooltips-custom";
import { cn } from "@/lib/utils";

type TTooltipWrap = {
    title: string;
} & React.HTMLAttributes<HTMLDivElement> &
    React.PropsWithChildren;

export default function TooltipWrap(props: TTooltipWrap) {
    const { title, children, className } = props;
    const [shouldShowTooltip, setShouldShowTooltip] = useState(false);
    const titleRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkWidth = () => {
            if (contentRef.current) {
                const title = contentRef.current?.querySelector(
                    ".js-text-ellipsis"
                ) as HTMLDivElement;
                const titleWidth = title?.scrollWidth || 0;
                const contentWidth =
                    (
                        contentRef.current.querySelector(
                            ".js-text-ellipsis"
                        ) as HTMLDivElement
                    )?.offsetWidth || 0;
                setShouldShowTooltip(titleWidth > contentWidth);
            }
        };

        checkWidth();
        window.addEventListener("resize", checkWidth);

        return () => {
            window.removeEventListener("resize", checkWidth);
        };
    }, [title]);

    return (
        <div className={cn("relative w-full", className)}>
            <div>
                <CustomTooltip
                    className={cn(
                        "w-full",
                        shouldShowTooltip
                            ? "cursor-pointer rounded-[0.3125rem] border border-transparent transition-all hover:border-bd-brown"
                            : ""
                    )}
                    childClass="bottom-[calc(100%-0.75rem)] left-1/2 -translate-x-1/2"
                    content={title}
                    isHide={!shouldShowTooltip}
                >
                    <div ref={titleRef}>{children}</div>
                    <div
                        className="h-0 overflow-hidden [&>*]:line-clamp-none [&>*]:whitespace-nowrap"
                        ref={contentRef}
                    >
                        {children}
                    </div>
                </CustomTooltip>
            </div>
        </div>
    );
}
