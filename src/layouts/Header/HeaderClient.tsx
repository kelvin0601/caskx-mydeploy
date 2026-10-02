"use client";

import { IconBell } from "@/components/shared/icons/icon-bell";
import IconSearch from "@/components/shared/icons/icon-search";
import IconStar from "@/components/shared/icons/icon-start";
import ImagePreload from "@/components/shared/image-preload";
import LinkCustom from "@/components/shared/link-custom";
import useClickOutSide from "@/hooks/useClickOutSide";
import { TMenuNavigation } from "@/lib/constants";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeaderActionIcon } from "./header-action-icon";
import { HeaderSearchWrapper } from "./header-search-wrapper";
import MobileMenu from "./mobile-menu";
import Search from "./search";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationDropdown from "@/components/shared/notification-dropdown";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HeaderClient({
    children,
    menuItems,
    headerStats,
    userAction,
    isMobile,
}: {
    children: React.ReactNode;
    menuItems: TMenuNavigation[];
    headerStats: React.ReactNode;
    userAction: React.ReactNode;
    isMobile: boolean;
}) {
    const isMobileClient = useIsMobile();
    const pathname = usePathname();
    const [mounted, setMounted] = useState<boolean>(false);
    const isMobileC = mounted ? isMobileClient : isMobile;
    // const [isVisible, setIsVisible] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const headerRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useClickOutSide(() => {
        if (isSearchOpen) {
            setIsSearchOpen(false);
        }
    }, searchContainerRef);

    const controlHeader = useCallback(() => {
        if (typeof window !== undefined && headerRef.current) {
            const currentScrollY = window.scrollY;

            if (
                currentScrollY < lastScrollY ||
                currentScrollY < headerRef.current.clientHeight * 1.5
            ) {
                // setIsVisible(true);
                // document.body.classList.remove("header-hidden");
            } else if (
                currentScrollY > lastScrollY &&
                currentScrollY > headerRef.current.clientHeight
            ) {
                // document.body.classList.add("header-hidden");
                // setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        }
    }, [lastScrollY]);

    useEffect(() => {
        if (typeof window !== undefined) {
            document.documentElement.style.setProperty(
                "--height-header",
                `${headerRef.current?.clientHeight}px`
            );
            window.addEventListener("scroll", controlHeader);
            return () => window.removeEventListener("scroll", controlHeader);
        }
    }, [controlHeader]);
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setIsSearchOpen(false);
    }, [pathname]);

    return (
        <>
            <header
                ref={headerRef}
                className={`sticky top-0 z-30 w-full bg-black backdrop-blur-[5px] transition-transform duration-300 ease-out dk:h-[3.75rem] dk:border-b dk:border-bd-dark-main tb:h-[3.25rem] j-tb:h-[3.25rem] mb:h-12`}
            >
                <div className="container mx-auto flex h-full items-center justify-between border-bd-dark-main tb:border-b">
                    {/* Left Section: Logo & Navigation */}
                    <div className="flex w-full items-center justify-start gap-8">
                        {/* Logo */}

                        <LinkCustom
                            href="/"
                            className="h-4 w-[11.0625rem] flex-none overflow-hidden mb:h-auto mb:w-[9.625rem]"
                        >
                            <ImagePreload
                                alt="Logo"
                                src={"/images/logo-full-fx.png"}
                                width={440}
                                height={40}
                                className="img-w tb:h-full"
                            />
                        </LinkCustom>

                        {/* Desktop Navigation */}
                        <div className="hidden items-center justify-start gap-8 dk:flex">
                            {children}
                        </div>
                    </div>

                    {/* Right Section: Search & Profile */}
                    <div className="flex h-14 shrink-0 items-center justify-start tb:h-full mb:h-12">
                        {/* Search & Actions */}
                        <div
                            ref={searchContainerRef}
                            className="flex items-center justify-start self-stretch"
                        >
                            {/* Search Bar */}
                            <HeaderSearchWrapper
                                isOpen={isMobileC ? isSearchOpen : true}
                                isMobile={isMobileC}
                            >
                                {<Search />}
                            </HeaderSearchWrapper>

                            <HeaderActionIcon
                                aria-label={
                                    isSearchOpen
                                        ? "Close search"
                                        : "Open search"
                                }
                                isOpen={isSearchOpen}
                                icon={
                                    isSearchOpen ? (
                                        <X className="h-4 w-4" />
                                    ) : (
                                        <IconSearch />
                                    )
                                }
                                className="hidden mb:flex mb:border-l"
                                onClick={() => {
                                    setIsSearchOpen((prev) => {
                                        const next = !prev;
                                        if (next) {
                                            setIsMobileMenuOpen(false);
                                        }
                                        return next;
                                    });
                                }}
                            />
                            {/* Additional Icons */}
                            <HeaderActionIcon
                                aria-label="Watchlist"
                                icon={<IconStar />}
                                className="border-r mb:border-l"
                            />

                            <NotificationDropdown />
                        </div>

                        {/* User Profile */}
                        <div className="relative flex h-full items-center pl-5 tb:hidden">
                            {userAction}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="dk:hidden">
                            <MobileMenu
                                menuItems={menuItems}
                                open={isMobileMenuOpen}
                                onOpenChange={(open) => {
                                    setIsMobileMenuOpen(open);
                                    if (open) setIsSearchOpen(false);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </header>
            {pathname === "/" && headerStats}
        </>
    );
}
