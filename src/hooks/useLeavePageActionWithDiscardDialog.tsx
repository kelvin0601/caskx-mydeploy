"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLeavePageAction } from "@/hooks/useLeavePageAction";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useLeavePageActionWithDiscardDialog({
    shouldBlock,
    enabled = true,
    beforeUnloadMessage = "You have unsaved changes. Leave this page?",
    interceptCmdW = true,
    interceptCmdR = true,
    nativeBeforeUnloadMessage = "",
}: {
    shouldBlock: boolean;
    enabled?: boolean;
    beforeUnloadMessage?: string;
    interceptCmdW?: boolean;
    interceptCmdR?: boolean;
    nativeBeforeUnloadMessage?: string;
}) {
    const [open, setOpen] = useState(false);
    const pendingResolveRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback(async () => {
        if (!enabled || !shouldBlock) return true;

        return await new Promise<boolean>((resolve) => {
            pendingResolveRef.current = resolve;
            setOpen(true);
        });
    }, [enabled, shouldBlock]);

    const onOpenChange = useCallback((nextOpen: boolean) => {
        setOpen(nextOpen);

        // If user dismissed the dialog (click overlay / cancel), resolve as "false".
        if (!nextOpen && pendingResolveRef.current) {
            pendingResolveRef.current(false);
            pendingResolveRef.current = null;
        }
    }, []);

    const { confirmAndRun } = useLeavePageAction({
        shouldBlock,
        enabled,
        message: nativeBeforeUnloadMessage,
        // Attach to `beforeunload` to prevent the browser from closing/reloading
        // before the custom dialog is rendered. We pass an empty message by
        // default, so we don't set `event.returnValue` (best-effort).
        attachBeforeUnload: true,
        confirm: async (_message: string) => await confirm(),
    });

    useEffect(() => {
        if (!enabled || !shouldBlock) return;

        const handler = (event: KeyboardEvent) => {
            if (!event.metaKey) return;
            if (open) return;

            const key = String(event.key || "").toLowerCase();

            const isCmdR = interceptCmdR && key === "r";
            const isCmdW = interceptCmdW && key === "w";

            if (!isCmdR && !isCmdW) return;

            event.preventDefault();
            event.stopPropagation();

            if (isCmdR) {
                void confirmAndRun(() => window.location.reload());
                return;
            }

            if (isCmdW) {
                void confirmAndRun(() => window.close());
            }
        };

        const options = { capture: true } as const;
        window.addEventListener("keydown", handler, options);
        return () => window.removeEventListener("keydown", handler, options);
    }, [
        enabled,
        shouldBlock,
        interceptCmdW,
        interceptCmdR,
        open,
        confirmAndRun,
    ]);

    const DiscardChangesDialog = useMemo(() => {
        return (
            <AlertDialog open={open} onOpenChange={onOpenChange}>
                <AlertDialogContent
                    isShowClose
                    className="w-full max-w-[31.25rem] gap-0 border-0 bg-bg-main p-0 shadow-none mb:max-w-[calc(100vw-2rem)]"
                    classClose="rounded-lg p-2 text-icon-main hover:text-icon-highlight"
                >
                    <AlertDialogHeader className="space-y-0 text-center sm:text-center">
                        <AlertDialogTitle className="mb-2 w-full font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                            Discard Unsaved Changes?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="w-full text-center text-sm font-normal leading-[1.5] text-typo-soft">
                            You have unsaved changes that will be lost if you
                            leave this page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="mt-8 w-full items-start gap-1 mb:mt-6 mb:flex-col-reverse mb:gap-2">
                        <AlertDialogCancel
                            className="h-12 min-w-[9.375rem] flex-1 rounded-none border border-bd-main bg-transparent px-8 py-4 text-sm font-medium leading-none text-typo-primary outline-none hover:bg-transparent hover:text-typo-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary mb:h-10 mb:w-full mb:min-w-0 mb:px-4 mb:py-2"
                            onClick={() => {
                                // onOpenChange will handle resolve(false)
                                setOpen(false);
                            }}
                        >
                            Continue Editing
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 min-w-[9.375rem] flex-1 rounded-none border-0 !bg-bg-dark-main px-8 py-4 text-sm font-medium leading-none !text-typo-dark-primary outline-none hover:!bg-bg-dark-main focus-visible:!bg-bg-dark-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary mb:h-10 mb:w-full mb:min-w-0 mb:px-4 mb:py-2"
                            onClick={() => {
                                pendingResolveRef.current?.(true);
                                pendingResolveRef.current = null;
                                setOpen(false);
                            }}
                        >
                            Discard
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }, [open, onOpenChange]);

    return { confirmAndRun, DiscardChangesDialog };
}
