"use client";

import { KEY_RESET_PREV_PAGE } from "@/lib/constants/keyword";
import securityService from "@/services/security";
import { setCookie } from "cookies-next/client";
import { signOut } from "next-auth/react";
import { handleRenderFallbackText } from "@/lib/utils";
import ImagePreload from "@/components/shared/image-preload";
import IconSetting from "@/components/shared/icons/icon-settings";
import IconLogout from "@/components/shared/icons/icon-logout";
import IconArUpBold from "@/components/shared/icons/icon-ar-up-bold";
import { Session } from "next-auth";
import LinkCustom from "@/components/shared/link-custom";
import ClipPathTransition from "@/components/shared/animation/clip-path-transition";
import { useState, useRef } from "react";
import useClickOutSide from "@/hooks/useClickOutSide";
import { Dropdown, DropdownList, DropdownItem } from "@/components/ui/dropdown";

export default function UserActionClient({
    session,
}: {
    session: Session | null;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useClickOutSide(() => setIsOpen(false), containerRef);

    return (
        <div ref={containerRef} className="flex-1">
            <div className="flex-center flex gap-3">
                <div
                    className="group flex cursor-pointer items-center justify-start gap-3 outline-none"
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    <div className="shrink-0 overflow-hidden rounded-full transition-colors">
                        <ImagePreload
                            src={
                                session?.user?.image || "/images/user_place.jpg"
                            }
                            alt={`${session?.user?.name} avatar`}
                            height={32}
                            width={32}
                            typePlaceHolder="user"
                            className="h-8 w-8 rounded-full"
                        />
                    </div>
                    <div className="inline-flex flex-col items-start justify-start">
                        <div className="justify-start self-stretch text-sm font-medium text-typo-dark-primary transition-colors">
                            {handleRenderFallbackText(session?.user?.name)}
                        </div>
                        <div className="justify-start self-stretch text-xs font-normal text-typo-dark-soft">
                            {handleRenderFallbackText(session?.user?.email)}
                        </div>
                    </div>
                </div>

                <ClipPathTransition
                    isOpen={isOpen}
                    className="absolute -left-[0.125rem] top-[calc(100%+1px)] z-50 -mt-px w-full min-w-[calc(100%+var(--padding-container)+1px)]"
                >
                    <Dropdown
                        dark
                        isShowDot={false}
                        className="border-bd-brown px-0 py-0"
                    >
                        <DropdownList>
                            <DropdownItem className="hover:bg-white/5 flex items-center justify-between px-4 py-3.5 text-typo-dark-sub transition-all hover:text-typo-dark-primary">
                                <LinkCustom
                                    href="/settings/account"
                                    onClick={() => setIsOpen(false)}
                                    className="flex w-full items-center justify-between text-sm font-medium outline-none transition-colors"
                                >
                                    <span>Settings</span>
                                    <div className="h-4 w-4">
                                        <IconSetting />
                                    </div>
                                </LinkCustom>
                            </DropdownItem>

                            <DropdownItem
                                onClick={async () => {
                                    setIsOpen(false);
                                    setCookie(KEY_RESET_PREV_PAGE, true);
                                    await securityService.logoutSessionCurrent();
                                    await signOut();
                                }}
                                className="hover:bg-white/5 flex items-center justify-between px-4 py-3.5 text-sm font-medium text-typo-dark-sub transition-all hover:text-typo-dark-primary"
                            >
                                <span>Log out</span>
                                <div className="h-4 w-4">
                                    <IconLogout />
                                </div>
                            </DropdownItem>
                        </DropdownList>
                    </Dropdown>
                </ClipPathTransition>
            </div>
        </div>
    );
}
