"use client";

import { convertRemToPx } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import IconClose from "../shared/icons/icon-close";
import { IconSoonerCheck } from "../shared/icons/icon-sooner-check";
import { IconSoonerError } from "../shared/icons/icon-sooner-error";
import { IconSoonerWarning } from "../shared/icons/icon-sooner-warning";
import useResponsive from "@/hooks/useResponsive";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();
    const { isDesktop } = useResponsive();
    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            position="top-right"
            richColors
            visibleToasts={3}
            offset={{
                top: convertRemToPx(isDesktop ? 1.5 : 1),
                right: convertRemToPx(isDesktop ? 1.5 : 1),
                bottom: convertRemToPx(isDesktop ? 1.5 : 1),
                left: convertRemToPx(isDesktop ? 1.5 : 1),
            }}
            style={
                {
                    ["--width"]: "max-content",
                    ["--gap"]: "1rem",
                    ["--offset"]: "1rem !important",
                } as React.CSSProperties
            }
            icons={{
                success: <IconSoonerCheck />,
                error: <IconSoonerError />,
                warning: <IconSoonerWarning />,
                close: (
                    <div className="[&_path]:stroke-current">
                        <IconClose />
                    </div>
                ),
            }}
            toastOptions={{
                closeButton: props.closeButton ?? true,
                duration: 2000,
                unstyled: true,
                classNames: {
                    closeButton:
                        "static flex-shrink-0 !transform-none order-last top-0 right-0 !bg-transparent !border-unset !m-0 !border-none w-4 h-4 text-typo-note hover:text-typo-primary transition-colors cursor-pointer",
                    content: "font-inter font-semibold text-sm flex-1",
                    success:
                        "!bg-bg-sf1 dark:!bg-bg-dark-main !border-bd-main dark:!border-bd-dark-main border !text-typo-primary dark:!text-typo-dark-primary",
                    error: "!bg-bg-sf1 dark:!bg-bg-dark-main !border-bd-main dark:!border-bd-dark-main border !text-typo-primary dark:!text-typo-dark-primary",
                    warning:
                        "!bg-bg-sf1 dark:!bg-bg-dark-main !border-bd-main dark:!border-bd-dark-main border !text-typo-primary dark:!text-typo-dark-primary",
                    toast: "relative flex items-center group toast group-[.toaster]:bg-bg-sf1 dark:group-[.toaster]:bg-bg-dark-main group-[.toaster]:text-typo-primary dark:group-[.toaster]:text-typo-dark-primary group-[.toaster]:shadow-lg p-3 text-sm max-w-sm gap-3 border border-bd-main dark:border-bd-dark-main max-w-[38rem]",
                    description:
                        "group-[.toast]:text-typo-soft text-xs font-normal mt-0.5",
                    icon: "flex-shrink-0 w-4 h-4 m-0",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    title: "font-semibold",
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
