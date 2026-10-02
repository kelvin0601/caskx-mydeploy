"use client";

import LinkCustom from "@/components/shared/link-custom";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FaqGroup } from "@/modules/resources/utils/faq-groups";

type ResourceFaqNavigationProps = {
    groups: FaqGroup[];
    activeGroupId: string;
    onSelect: (groupId: string) => void;
};

export function ResourceFaqSidebar({
    groups,
    activeGroupId,
    onSelect,
}: ResourceFaqNavigationProps) {
    return (
        <div className="w-[20.3125rem] shrink-0 border-r border-bd-main tb:hidden">
            <aside
                aria-label="FAQ categories"
                className="sticky top-[var(--height-header)] z-10 max-h-[calc(100vh-var(--height-header))] w-full overflow-y-auto bg-bg-main transition-all duration-100 header-hidden:top-0 header-hidden:max-h-screen"
            >
                <nav className="flex flex-col">
                    {groups.map((group) => {
                        const isActive = group.id === activeGroupId;
                        return (
                            <LinkCustom
                                key={group.id}
                                href={`#${group.id}`}
                                scroll={false}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onSelect(group.id);
                                }}
                                className={cn(
                                    "flex w-full items-center justify-between border-b border-bd-main px-6 py-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
                                    isActive
                                        ? "font-semibold text-typo-primary"
                                        : "text-typo-soft hover:text-typo-primary"
                                )}
                            >
                                <span className="text-sm font-semibold">
                                    {group.title}
                                </span>
                                {isActive ? (
                                    <span
                                        aria-hidden="true"
                                        className="size-1.5 shrink-0 rounded-full bg-typo-primary"
                                    />
                                ) : null}
                            </LinkCustom>
                        );
                    })}
                </nav>
            </aside>
        </div>
    );
}

export function ResourceFaqMobileNavigation({
    groups,
    activeGroupId,
    onSelect,
}: ResourceFaqNavigationProps) {
    return (
        <div className="sticky top-[var(--height-header)] z-20 -mx-[var(--padding-container)] hidden flex-col gap-1 bg-bg-main px-[var(--padding-container)] pt-4 transition-all duration-200 header-hidden:top-px tb:flex">
            <span className="text-xs font-normal text-typo-soft">Category</span>
            <Select value={activeGroupId} onValueChange={onSelect}>
                <SelectTrigger variant="underline" aria-label="Select category">
                    <SelectValue placeholder="Select category">
                        {
                            groups.find((group) => group.id === activeGroupId)
                                ?.title
                        }
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                                {group.title}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}
