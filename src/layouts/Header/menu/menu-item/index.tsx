"use client";

import LinkCustom from "@/components/shared/link-custom";
import { ROUTE_PUBLIC, TMenuNavigation } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useCallback } from "react";
import MenuDropdown from "./menu-dropdown";

type TProp = {
    isNavigationMenu?: boolean;
    className?: string;
    classNameNavigation?: string;
} & TMenuNavigation &
    PropsWithChildren;

export default function MenuItem(props: TProp) {
    const {
        title,
        subItems,
        isNavigationMenu,
        href,
        children,
        isOpenWindow,
        className,
        classNameNavigation,
    } = props;
    const pathName = usePathname();
    const isSubActive = subItems?.some((item) => {
        const itemHref = item.href || "";
        return pathName === itemHref || pathName?.startsWith(itemHref + "/");
    });
    const checkActive = useCallback(
        (hrefToCheck: string | undefined) => {
            if (!hrefToCheck) return false;
            return (
                hrefToCheck.includes(pathName) && pathName !== ROUTE_PUBLIC.HOME
            );
        },
        [pathName]
    );

    const isActive = checkActive(href) || isSubActive;

    return (
        <div
            className={cn(
                "after:contents-[''] group relative text-typo-soft after:absolute after:left-0 after:top-full after:w-full after:pb-4",
                isActive && "text-typo-brand",
                className
            )}
        >
            {children ? (
                children
            ) : href ? (
                <LinkCustom
                    className="flex cursor-pointer flex-row items-center gap-1 transition-all"
                    {...(isOpenWindow && { target: "_blank" })}
                    href={href}
                >
                    <div className="text-sm font-medium">{title}</div>
                    {isNavigationMenu && (
                        <Image
                            src="/icons/chevon-down.svg"
                            width={32}
                            height={32}
                            alt="arrow-down"
                            className="h-3 w-3 duration-500 group-hover:rotate-180"
                        />
                    )}
                </LinkCustom>
            ) : (
                <div className="flex cursor-pointer flex-row items-center gap-1 transition-all">
                    <div className="text-sm font-medium">{title}</div>
                </div>
            )}

            {subItems && (
                <MenuDropdown
                    subItems={subItems}
                    classNameNavigation={classNameNavigation}
                />
            )}
        </div>
    );
}
