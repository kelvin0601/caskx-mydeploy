"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";
import IconHelp from "../icons/icon-help";
import CustomTooltip from "../tooltips-custom";
type TPropsHeading = {
    tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
} & HTMLAttributes<HTMLHeadingElement> & {
        subTitle?: string;
    };
const HeadingContent = forwardRef<HTMLHeadingElement, TPropsHeading>(
    (props, ref) => {
        const { className, tag = "h2", children, subTitle, ...params } = props;
        const Tag = tag;
        return (
            <Tag
                ref={ref}
                className={cn(
                    "max-w-[31.9375rem] font-reckless text-3xl font-medium capitalize !leading-[1em] text-typo-primary tb:text-2xl mb:text-xl",
                    className
                )}
                {...params}
            >
                {children}
                {subTitle && (
                    <CustomTooltip content={subTitle} isHide={false}>
                        <Button variant={"empty"} className="!min-w-max !p-1">
                            <div className="h-4 w-4">
                                <IconHelp />
                            </div>
                        </Button>
                    </CustomTooltip>
                )}
            </Tag>
        );
    }
);

export default HeadingContent;

HeadingContent.displayName = "HeadingContent";

export const HeadingContentSkeleton = () => {
    return (
        <div className="flex w-[20rem] flex-col gap-2">
            <Skeleton className="h-10 w-full bg-bg-sf3" />
        </div>
    );
};
