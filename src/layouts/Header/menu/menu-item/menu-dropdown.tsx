"use client";

import LinkCustom from "@/components/shared/link-custom";
import { TMenuNavigation } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Dropdown, DropdownList, DropdownItem } from "@/components/ui/dropdown";

type TMenuDropdownProps = {
    subItems: NonNullable<TMenuNavigation["subItems"]>;
    classNameNavigation?: string;
};

export default function MenuDropdown({
    subItems,
    classNameNavigation,
}: TMenuDropdownProps) {
    const pathname = usePathname();

    return (
        <Dropdown
            className={cn(
                "pointer-events-none absolute -left-10 top-[calc(100%+0.5rem)] min-w-[12.5rem] translate-y-4 opacity-0 duration-500 ease-in-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100",
                classNameNavigation
            )}
        >
            <DropdownList>
                {subItems.map((subItem) => {
                    const isActive = subItem.href === pathname;
                    return (
                        <DropdownItem
                            key={subItem.title}
                            isActive={isActive}
                            className="cursor-pointer p-0"
                        >
                            {subItem.href ? (
                                <LinkCustom
                                    href={subItem.href}
                                    {...(subItem.isOpenWindow && {
                                        target: "_blank",
                                    })}
                                    onClick={subItem?.onClick}
                                    className="flex size-full flex-row items-center gap-2 px-4 py-3 text-sm font-medium text-typo-primary transition-colors"
                                >
                                    {subItem.icon && (
                                        <div>{subItem.icon()}</div>
                                    )}{" "}
                                    {subItem.title}
                                </LinkCustom>
                            ) : (
                                <div
                                    onClick={subItem?.onClick}
                                    className="flex size-full flex-row items-center gap-2 px-4 py-3 text-sm font-medium text-typo-primary"
                                >
                                    {subItem.icon && (
                                        <div>{subItem.icon()}</div>
                                    )}{" "}
                                    {subItem.title}
                                </div>
                            )}
                        </DropdownItem>
                    );
                })}
            </DropdownList>
        </Dropdown>
    );
}
