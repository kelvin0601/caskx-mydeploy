"use client";

import { env } from "@/config/env";

const NEXTAUTH_CLIENT_DEBUG = env.nextAuthDebug;

export const logNextAuthClientDebug = (
    context: string,
    details?: Record<string, unknown>
) => {
    if (!NEXTAUTH_CLIENT_DEBUG) return;
    if (typeof window === "undefined") return;

    console.info("[NextAuth client debug]", {
        context,
        location: window.location.origin,
        ...details,
    });
};
