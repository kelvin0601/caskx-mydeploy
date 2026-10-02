"use client";

import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import * as React from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import ScrollAreaWithFade from "../shared/scroll-area-with-fade";
import IconSearch from "../shared/icons/icon-search";

import IconClose from "@/components/shared/icons/icon-close";

const Command = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
    <CommandPrimitive
        ref={ref}
        className={cn(
            "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
            className
        )}
        {...props}
    />
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
    return (
        <Dialog {...props}>
            <DialogContent className="overflow-hidden p-0 shadow-lg">
                <DialogTitle className="sr-only">Command menu</DialogTitle>
                <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    );
};

const CommandInput = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Input>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => {
    const [hasValue, setHasValue] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const setRefs = React.useCallback(
        (node: HTMLInputElement | null) => {
            inputRef.current = node;
            if (node) {
                setHasValue(!!node.value);
            }
            if (typeof ref === "function") {
                ref(node);
            } else if (ref) {
                (
                    ref as React.MutableRefObject<HTMLInputElement | null>
                ).current = node;
            }
        },
        [ref]
    );

    React.useEffect(() => {
        if (inputRef.current) {
            setHasValue(!!inputRef.current.value);
        }
    }, [props.value]);

    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
            const event = new Event("input", { bubbles: true });
            inputRef.current.dispatchEvent(event);
            inputRef.current.focus();
            setHasValue(false);
        }
    };

    return (
        <div
            className={cn(
                "mb-4 flex h-12 w-full items-center border border-transparent bg-bg-sf4 px-4 text-sm text-typo-primary transition-all hover:border-bd-main disabled:bg-bg-disable dark:bg-bg-dark-sf4 dark:text-typo-dark-primary dark:hover:border-bd-dark-main dark:disabled:bg-bg-dark-disable mb:h-10 mb:px-3",
                className
            )}
            cmdk-input-wrapper=""
        >
            <div className="mr-2 h-5 w-5 shrink-0 text-icon dark:text-icon-dark-main">
                <IconSearch />
            </div>
            <CommandPrimitive.Input
                ref={setRefs}
                className={cn(
                    "flex w-full bg-transparent text-base text-typo-primary caret-brand !outline-none placeholder:text-typo-soft disabled:cursor-not-allowed disabled:opacity-50 dark:text-typo-dark-primary dark:placeholder:text-typo-dark-soft"
                )}
                onInput={(e) => {
                    setHasValue(!!(e.target as HTMLInputElement).value);
                    props.onInput?.(e);
                }}
                {...props}
            />
            {hasValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-icon transition-colors hover:text-typo-primary dark:text-icon-dark-main dark:hover:text-typo-dark-primary"
                    aria-label="Clear search"
                >
                    <IconClose />
                </button>
            )}
        </div>
    );
});

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, children, ...props }, ref) => (
    <CommandPrimitive.List ref={ref} className={cn("", className)} {...props}>
        <ScrollAreaWithFade className="mr-0 max-h-60 pr-2">
            {children}
        </ScrollAreaWithFade>
    </CommandPrimitive.List>
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Empty>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
    <CommandPrimitive.Empty
        ref={ref}
        className="py-6 text-center text-sm"
        {...props}
    />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Group>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Group
        ref={ref}
        className={cn(
            "overflow-hidden text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
            className
        )}
        {...props}
    />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 h-px bg-border", className)}
        {...props}
    />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center gap-2 rounded-sm text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            className
        )}
        {...props}
    />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
        <span
            className={cn(
                "ml-auto text-xs tracking-widest text-muted-foreground",
                className
            )}
            {...props}
        />
    );
};
CommandShortcut.displayName = "CommandShortcut";

export {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
};
