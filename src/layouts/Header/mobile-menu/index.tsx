"use client";

import LinkCustom from "@/components/shared/link-custom";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ROUTE_PUBLIC, TMenuNavigation } from "@/lib/constants";
import { KEY_RESET_PREV_PAGE } from "@/lib/constants/keyword";
import { cn } from "@/lib/utils";
import securityService from "@/services/security";
import { setCookie } from "cookies-next/client";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useClickOutSide from "@/hooks/useClickOutSide";
import ImagePreload from "@/components/shared/image-preload";

export default function MobileMenu({
    menuItems,
    open: controlledOpen,
    onOpenChange,
}: {
    menuItems: TMenuNavigation[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const { data: session } = useSession();
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const open =
        controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
    const setOpen = (val: boolean | ((prev: boolean) => boolean)) => {
        const next = typeof val === "function" ? val(open) : val;
        if (onOpenChange) {
            onOpenChange(next);
        } else {
            setUncontrolledOpen(next);
        }
    };
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    useClickOutSide(() => setOpen(false), containerRef);

    const handleLogout = async () => {
        setCookie(KEY_RESET_PREV_PAGE, true);
        await securityService.logoutSessionCurrent();
        await signOut();
    };

    return (
        <div
            ref={containerRef}
            className="hidden border-r border-bd-dark-main tb:block"
        >
            <Button
                size="icon"
                variant="empty"
                className="size-[3.25rem] text-typo-dark-primary mb:size-12"
                onClick={() => setOpen((prev) => !prev)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
            >
                <div className="h-4 w-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        viewBox="0 0 16 16"
                        fill="none"
                    >
                        <path
                            d="M2.00199 3.5H14"
                            stroke={
                                open
                                    ? "hsl(var(--light))"
                                    : "hsl(var(--text-dark-sub))"
                            }
                            strokeWidth="1.3"
                            strokeLinejoin="round"
                            className="transition-all duration-300"
                            style={{
                                transformOrigin: "center",
                                transform: open
                                    ? "translateY(0.36rem) rotate(45deg) translateX(-0.27rem)"
                                    : "none",
                            }}
                        />
                        <path
                            d="M2 8.07143H13.995"
                            stroke={
                                open
                                    ? "hsl(var(--light))"
                                    : "hsl(var(--text-dark-sub))"
                            }
                            strokeWidth="1.3"
                            strokeLinejoin="round"
                            className="transition-all duration-300"
                            style={{
                                transformOrigin: "center",
                                opacity: open ? 0 : 1,
                                transform: open ? "scale(0)" : "none",
                            }}
                        />
                        <path
                            d="M2.00194 12.6429H13.995"
                            stroke={
                                open
                                    ? "hsl(var(--light))"
                                    : "hsl(var(--text-dark-sub))"
                            }
                            strokeWidth="1.3"
                            strokeLinejoin="round"
                            className="transition-all duration-300"
                            style={{
                                transformOrigin: "center",
                                transform: open
                                    ? "translateY(-0.44rem) rotate(-45deg) translateX(-0.3rem)"
                                    : "none",
                            }}
                        />
                    </svg>
                </div>
            </Button>

            <div
                className={cn(
                    "fixed inset-0 z-20 bg-black/50 transition-opacity duration-300",
                    open
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                )}
                style={{ top: "calc(var(--height-header) + 1px)" }}
                onClick={() => setOpen(false)}
            />

            <div
                id="mobile-menu"
                className={cn(
                    "fixed right-[var(--padding-container)] top-0 z-20 -mt-px flex h-auto max-h-[calc(100dvh-var(--height-header))] w-full flex-col overflow-hidden bg-bg-dark-main transition-[clip-path] duration-300 ease-out tb:max-w-[23.125rem] mb:-inset-x-1 mb:w-screen mb:max-w-none",
                    !open && "pointer-events-none"
                )}
                style={{
                    top: "var(--height-header)",
                    clipPath: open
                        ? "polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)"
                        : "polygon(0 0%, 100% 0%, 100% 0%, 0% 0%)",
                }}
            >
                <div className="flex-1 overflow-y-auto px-4 pt-1">
                    <Accordion type="single" collapsible>
                        {menuItems.map((item) => {
                            const hasSubItems =
                                item.subItems && item.subItems.length > 0;

                            if (hasSubItems) {
                                return (
                                    <AccordionItem
                                        key={item.title}
                                        value={item.title || ""}
                                        className="border-b border-bd-dark-main"
                                    >
                                        <AccordionTrigger className="py-4 text-base font-medium text-typo-dark-sub data-[state=open]:text-typo-dark-primary tb:text-sm">
                                            {item.title}
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-4">
                                            <div className="flex flex-col">
                                                {item.subItems?.map(
                                                    (subItem) => (
                                                        <LinkCustom
                                                            key={subItem.title}
                                                            href={
                                                                subItem.href ||
                                                                "#"
                                                            }
                                                            onClick={() =>
                                                                setOpen(false)
                                                            }
                                                            className={cn(
                                                                "py-2 text-base font-normal text-typo-dark-sub transition-colors first:pt-0 last:pb-0 hover:text-typo-brand tb:text-sm",
                                                                pathname ===
                                                                    subItem.href &&
                                                                    "text-typo-brand"
                                                            )}
                                                        >
                                                            {subItem.title}
                                                        </LinkCustom>
                                                    )
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            }

                            return (
                                <div
                                    key={item.title}
                                    className="border-b border-bd-dark-main"
                                >
                                    <LinkCustom
                                        href={item.href || "#"}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "flex py-4 text-base font-medium text-typo-dark-sub transition-colors hover:text-typo-brand tb:text-sm",
                                            pathname === item.href &&
                                                "text-typo-brand"
                                        )}
                                    >
                                        {item.title}
                                    </LinkCustom>
                                </div>
                            );
                        })}

                        <div className="border-b border-bd-dark-main">
                            <LinkCustom
                                href={ROUTE_PUBLIC.SETTINGS_ACCOUNT}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex py-4 text-base font-medium text-typo-dark-sub transition-colors hover:text-typo-brand tb:text-sm",
                                    pathname?.startsWith(
                                        ROUTE_PUBLIC.SETTINGS
                                    ) && "text-typo-brand"
                                )}
                            >
                                Settings
                            </LinkCustom>
                        </div>
                    </Accordion>
                </div>

                {session && (
                    <div className="flex items-center justify-between p-4 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="size-10 shrink-0 overflow-hidden rounded-full tb:size-8">
                                <ImagePreload
                                    src={
                                        session.user?.image ||
                                        "/images/user_place.jpg"
                                    }
                                    alt={`${session.user?.name} avatar`}
                                    height={40}
                                    width={40}
                                    typePlaceHolder="user"
                                    className="h-full w-full rounded-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <div className="text-sm font-semibold leading-[1.5em] text-typo-dark-primary">
                                    {session.user?.name || "User"}
                                </div>
                                <div className="text-xs text-typo-dark-sub">
                                    {session.user?.email || ""}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="empty"
                            className="p-0 text-xs text-destructive"
                            onClick={handleLogout}
                        >
                            Log Out
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
