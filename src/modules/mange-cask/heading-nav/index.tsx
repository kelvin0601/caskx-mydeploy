"use client";

import LinkCustom from "@/components/shared/link-custom";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

export default function HeadingNav({
    title,
    description,
    subTitle,
    children,
}: {
    title?: string;
    description?: string;
    subTitle?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col">
            {title && (
                <div className="mb-12 flex flex-row justify-between border-b border-solid border-bd-brown pt-5">
                    <h1 className="pb-3 text-2xl font-semibold">{title}</h1>
                    {children && children}
                </div>
            )}
            {(subTitle || description) && (
                <div className="mb-6 flex flex-col gap-0.5">
                    {subTitle && (
                        <div className="t ext-typo-primary text-lg font-semibold">
                            {subTitle}
                        </div>
                    )}
                    {description && (
                        <div className="text-sm text-typo-note">
                            {description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export const SubHeadingNav = () => {
    const router = useRouter();
    const pathname = usePathname();
    const ROUTES_BID = [
        {
            title: "Bids",
            href: ROUTE_PUBLIC.MANAGE_BIDS,
        },
        {
            title: "Payments",
            href: ROUTE_PUBLIC.MANAGE_PAYMENTS,
        },
    ];
    return (
        <div className="flex flex-row gap-3">
            {ROUTES_BID.map((route) => {
                const isActive = pathname.includes(route.href);
                return (
                    <LinkCustom
                        key={route.title}
                        className={cn(
                            "border-b border-solid border-transparent pb-4 text-base font-medium text-typo-soft",
                            isActive && "border-typo-primary text-typo-primary"
                        )}
                        href={route.href}
                    >
                        {route.title}
                    </LinkCustom>
                );
            })}
        </div>
    );
};
