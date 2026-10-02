"use client";

import ImagePreload from "@/components/shared/image-preload";
import LinkCustom from "@/components/shared/link-custom";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

import IconLogout from "@/components/shared/icons/icon-logout";
import { MENU_DASHBOARD } from "@/lib/constants";

export default function SidebarDashBoard() {
    const pathname = usePathname();
    const router = useRouter();
    const { data } = useSession();
    const { user } = data || { user: null };
    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push(ROUTE_PUBLIC.HOME);
    };

    return (
        <aside className="sticky top-0 flex h-screen min-h-screen w-[20.375rem] flex-col justify-between border-r border-bd-dark-main bg-bg-dark-main dk:col-start-1 dk:col-end-3 tb:min-h-full tb:w-full tb:border-none">
            <div className="flex flex-col">
                <div className="border-b border-bd-dark-main px-6 py-8">
                    <LinkCustom href={ROUTE_PUBLIC.HOME}>
                        <ImagePreload
                            src="/images/logo-full-fx.png"
                            width={177}
                            height={16}
                            alt="Cask Exchange"
                            className="h-4 w-auto"
                        />
                    </LinkCustom>
                </div>

                {/* Navigation groups */}
                <nav className="flex flex-col">
                    {MENU_DASHBOARD.map((group, groupIndex) => {
                        const GroupIcon = group.Icon;
                        return (
                            <div key={group.title}>
                                <div
                                    className={cn(
                                        "flex items-center gap-2 px-6 pb-2 pt-4 text-typo-dark-primary",
                                        groupIndex > 0 &&
                                            "border-t border-bd-dark-main"
                                    )}
                                >
                                    <div className="size-4">
                                        <GroupIcon />
                                    </div>
                                    <span className="text-sm font-semibold leading-normal">
                                        {group.title}
                                    </span>
                                </div>

                                {/* Sub-items — Figma EL-f4b2535b: padding 0px 24px 8px */}
                                <div className="flex flex-col px-6 pb-2">
                                    {group.subItems.map((item) => {
                                        const isActive =
                                            pathname.includes(item.href) &&
                                            item.href !== ROUTE_PUBLIC.HOME;
                                        return (
                                            <LinkCustom
                                                key={item.title}
                                                href={item.href}
                                                prefetch={true}
                                                className={cn(
                                                    "flex w-full items-center justify-between px-6 py-2 transition-colors duration-200",
                                                    isActive
                                                        ? "bg-bg-dark-sf2 text-typo-dark-primary"
                                                        : "text-typo-dark-note hover:text-typo-dark-sub"
                                                )}
                                            >
                                                <span className="text-sm font-normal leading-normal">
                                                    {item.title}
                                                </span>
                                                {isActive && (
                                                    <span className="size-1.5 rounded-full bg-typo-dark-primary" />
                                                )}
                                            </LinkCustom>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center justify-between border-t border-bd-dark-main px-6 py-5">
                <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                    <div className="size-8 shrink-0 overflow-hidden rounded-full bg-bd-dark-main">
                        {/* {user?.avatar ? (
                            <ImagePreload
                                src={user.avatar}
                                width={32}
                                height={32}
                                alt={user?.name || "User"}
                                className="size-full object-cover"
                            />
                        ) : */}
                        {/* ( */}
                        <div className="flex size-full items-center justify-center text-xs font-semibold text-typo-dark-primary">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        {/* )} */}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5 overflow-hidden">
                        <span className="truncate text-sm font-semibold leading-[1.5] text-typo-dark-primary">
                            {user?.name ? `${user.name}` : "Admin"}
                        </span>
                        <span className="truncate text-xs font-normal leading-[1.2] text-typo-dark-soft">
                            {user?.email || ""}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="focus-visible:ring-white/70 flex size-9 shrink-0 touch-manipulation items-center justify-center text-icon-dark-main transition-colors hover:text-typo-dark-primary focus-visible:outline-none focus-visible:ring-2"
                    aria-label="Log out"
                >
                    <span className="size-5" aria-hidden="true">
                        <IconLogout />
                    </span>
                </button>
            </div>
        </aside>
    );
}
