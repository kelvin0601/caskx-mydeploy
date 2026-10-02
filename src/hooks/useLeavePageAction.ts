import { useCallback, useEffect, useMemo, useRef } from "react";

export type ConfirmFn = (message: string) => boolean | Promise<boolean>;

export type UseLeavePageActionOptions = {
    shouldBlock: boolean;
    enabled?: boolean;
    message?: string;
    onLeave?: () => void | Promise<void>;
    confirm?: ConfirmFn;
    attachBeforeUnload?: boolean;
};

export function useLeavePageAction({
    shouldBlock,
    enabled = true,
    message = "You have unsaved changes. Leave this page?",
    onLeave,
    confirm,
    attachBeforeUnload = true,
}: UseLeavePageActionOptions) {
    const onLeaveRef = useRef(onLeave);
    const confirmRef = useRef(confirm);
    const allowUnloadRef = useRef(false);

    useEffect(() => {
        onLeaveRef.current = onLeave;
    }, [onLeave]);

    useEffect(() => {
        confirmRef.current = confirm;
    }, [confirm]);

    const effectiveShouldBlock = useMemo(
        () => Boolean(enabled && shouldBlock),
        [enabled, shouldBlock]
    );

    useEffect(() => {
        if (!effectiveShouldBlock || !attachBeforeUnload) return;

        const handler = (event: BeforeUnloadEvent) => {
            if (allowUnloadRef.current) return;
            event.preventDefault();
            if (message) {
                event.returnValue = message;
                return message;
            }
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [effectiveShouldBlock, attachBeforeUnload, message]);

    const confirmAndRun = useCallback(
        async <T>(action: () => T | Promise<T>): Promise<T | undefined> => {
            if (!effectiveShouldBlock) {
                return await action();
            }

            const ok = confirmRef.current
                ? await confirmRef.current(message)
                : window.confirm(message);

            if (!ok) return undefined;

            allowUnloadRef.current = true;
            try {
                if (onLeaveRef.current) {
                    await onLeaveRef.current();
                }

                return await action();
            } finally {
                allowUnloadRef.current = false;
            }
        },
        [effectiveShouldBlock, message]
    );

    return {
        confirmAndRun,
    };
}
