"use client";

import IconDotsHorizontal from "@/components/shared/icons/icon-dots-horizontal";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem, DropdownList } from "@/components/ui/dropdown";
import useClickOutSide from "@/hooks/useClickOutSide";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type CaskEditMoreActionsProps = {
    activeAction?: number;
    onActiveActionChange?: (action: number) => void;
    onView: () => void;
    onDelete: () => void;
};

export function CaskEditMoreActions({
    activeAction = 0,
    onActiveActionChange,
    onView,
    onDelete,
}: CaskEditMoreActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useClickOutSide(() => setIsOpen(false), containerRef);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative inline-flex">
            <Button
                type="button"
                variant="empty"
                size="icon"
                className={cn(
                    "h-10 w-10 min-w-10 rounded-none border-none bg-transparent p-2 text-icon-main hover:bg-transparent hover:text-icon-highlight focus-visible:bg-transparent",
                    isOpen &&
                        "border border-bd-main bg-bg-sf2 text-icon-highlight hover:border-bd-main hover:bg-bg-sf2 hover:text-icon-highlight"
                )}
                onClick={() => {
                    const next = !isOpen;
                    setIsOpen(next);
                    if (next) onActiveActionChange?.(0);
                }}
                data-state={isOpen ? "open" : "closed"}
                aria-label="More actions"
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                <IconDotsHorizontal className="size-5" />
            </Button>
            {isOpen && (
                <Dropdown
                    className="absolute right-0 top-full z-50 mt-1 w-32 rounded-none border border-bd-main bg-bg-main px-4 py-0 text-typo-primary shadow-[0px_3px_8px_0px_rgba(23,0,0,0.1),0px_4px_6px_0px_rgba(15,0,0,0.1)]"
                    onPointerLeave={() => onActiveActionChange?.(0)}
                >
                    <DropdownList role="menu">
                        <DropdownItem
                            role="menuitem"
                            isActive={activeAction === 0}
                            className="flex h-12 items-center rounded-none border-b border-bd-main px-0 py-3 text-sm font-medium leading-[1.5] text-typo-sub hover:text-typo-primary data-[active=true]:bg-transparent data-[active=true]:text-typo-primary"
                            onPointerMove={() => onActiveActionChange?.(0)}
                            onFocus={() => onActiveActionChange?.(0)}
                            onClick={() => {
                                onView();
                                setIsOpen(false);
                            }}
                        >
                            <span className="min-w-0 flex-1 truncate">
                                View
                            </span>
                        </DropdownItem>
                        <DropdownItem
                            role="menuitem"
                            isActive={activeAction === 1}
                            className="flex h-12 items-center rounded-none px-0 py-3 text-sm font-medium leading-[1.5] text-typo-sub hover:text-typo-primary data-[active=true]:bg-transparent data-[active=true]:text-typo-primary"
                            onPointerMove={() => onActiveActionChange?.(1)}
                            onFocus={() => onActiveActionChange?.(1)}
                            onClick={() => {
                                onDelete();
                                setIsOpen(false);
                            }}
                        >
                            <span className="min-w-0 flex-1 truncate">
                                Delete
                            </span>
                        </DropdownItem>
                    </DropdownList>
                </Dropdown>
            )}
        </div>
    );
}
