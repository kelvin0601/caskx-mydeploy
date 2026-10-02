"use client";

import { useEffect, useRef } from "react";

export type ResourceLivePreviewMessage = {
    type: "payload-live-preview";
    collectionSlug?: string;
    globalSlug?: string;
    data: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function isResourceLivePreviewMessage(
    value: unknown
): value is ResourceLivePreviewMessage {
    return (
        isRecord(value) &&
        value.type === "payload-live-preview" &&
        isRecord(value.data)
    );
}

export function useResourceLivePreviewWorker({
    enabled,
    onMessage,
}: {
    enabled: boolean;
    onMessage: (message: ResourceLivePreviewMessage) => void;
}) {
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        if (!enabled) return;

        const previewOrigin = window.location.origin;
        let disposed = false;

        const handleWorkerMessage = (event: MessageEvent<unknown>) => {
            if (
                !isRecord(event.data) ||
                event.data.type !== "resources-live-preview" ||
                !isResourceLivePreviewMessage(event.data.payload)
            ) {
                return;
            }

            onMessageRef.current(event.data.payload);
        };

        const handleWindowMessage = (event: MessageEvent<unknown>) => {
            if (
                event.origin !== previewOrigin ||
                !isResourceLivePreviewMessage(event.data)
            ) {
                return;
            }

            const message = event.data;
            if (!("serviceWorker" in navigator)) {
                onMessageRef.current(message);
                return;
            }

            void (async () => {
                let fallbackTimer: number | undefined;
                try {
                    const registration =
                        (await navigator.serviceWorker.getRegistration("/")) ??
                        (await navigator.serviceWorker.register("/sw.js", {
                            scope: "/",
                        }));
                    const activeWorker =
                        navigator.serviceWorker.controller ??
                        (await navigator.serviceWorker.ready).active ??
                        registration.active;

                    if (disposed || !activeWorker) {
                        onMessageRef.current(message);
                        return;
                    }

                    const channel = new MessageChannel();
                    let workerReady = false;
                    const forwardToWorker = () => {
                        if (workerReady || disposed) return;
                        workerReady = true;
                        if (fallbackTimer !== undefined) {
                            window.clearTimeout(fallbackTimer);
                        }
                        activeWorker.postMessage({
                            type: "resources-live-preview-forward",
                            payload: message,
                        });
                    };
                    channel.port1.onmessage = (workerEvent) => {
                        if (
                            isRecord(workerEvent.data) &&
                            workerEvent.data.type ===
                                "resources-live-preview-ready"
                        ) {
                            forwardToWorker();
                        }
                    };
                    activeWorker.postMessage(
                        { type: "resources-live-preview-ping" },
                        [channel.port2]
                    );
                    fallbackTimer = window.setTimeout(() => {
                        if (workerReady || disposed) return;
                        workerReady = true;
                        onMessageRef.current(message);
                    }, 500);
                } catch {
                    if (fallbackTimer !== undefined) {
                        window.clearTimeout(fallbackTimer);
                    }
                    onMessageRef.current(message);
                }
            })();
        };

        navigator.serviceWorker?.addEventListener(
            "message",
            handleWorkerMessage
        );
        window.addEventListener("message", handleWindowMessage);
        window.parent.postMessage(
            { type: "payload-live-preview", ready: true },
            previewOrigin
        );

        return () => {
            disposed = true;
            navigator.serviceWorker?.removeEventListener(
                "message",
                handleWorkerMessage
            );
            window.removeEventListener("message", handleWindowMessage);
        };
    }, [enabled]);
}
