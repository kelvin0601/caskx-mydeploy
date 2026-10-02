import { env } from "@/config/env";
import { getSessionCookieName } from "@/lib/constants/auth";
import { AUTH_KEYS } from "@/lib/constants/key";
import { PATH_AUTH } from "@/lib/constants/path";
import { auth } from "@/types";
import { encode, JWT } from "next-auth/jwt";

const getBaseUrl = () => env.public_domain || "http://localhost:3000/api";

/** Call whoami with current accessToken; throws on 401 or request failure. */
export async function whoami(accessToken: string): Promise<auth.TUserSchema> {
    const res = await fetch(`${getBaseUrl()}${PATH_AUTH}/${AUTH_KEYS.WHOAMI}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });
    if (!res.ok) {
        const err = new Error(`whoami failed: ${res.status}`);
        (err as Error & { status: number }).status = res.status;
        throw err;
    }
    return res.json();
}

/** Call refreshToken; returns new tokens or throws. */
export async function refreshToken(
    refreshTokenValue: string
): Promise<auth.TToken> {
    const res = await fetch(
        `${getBaseUrl()}${PATH_AUTH}/${AUTH_KEYS.REFRESH_TOKEN}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: refreshTokenValue }),
        }
    );
    if (!res.ok) {
        const err = new Error(`refreshToken failed: ${res.status}`);
        console.log("err_______", err);
        (err as Error & { status: number }).status = res.status;
        throw err;
    }
    const data = await res.json();
    console.log("data_______token", data);
    return data;
}

const SESSION_MAX_AGE = 60 * 60 * 24 * 29; // 29 days

export async function encodeSessionCookie(
    currentToken: JWT,
    newTokens: auth.TToken
): Promise<string> {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error("NEXTAUTH_SECRET is not set");

    const updatedToken: JWT = {
        ...currentToken,
        accessToken: newTokens.accessToken ?? currentToken.accessToken,
        refreshToken: newTokens.refreshToken ?? currentToken.refreshToken,
    };

    return encode({
        secret,
        token: updatedToken,
        maxAge: SESSION_MAX_AGE,
    });
}

export function getSessionCookieOptions() {
    return {
        name: getSessionCookieName(),
        options: {
            httpOnly: true,
            secure:
                process.env.NODE_ENV === "production" ||
                process.env.NEXTAUTH_URL?.startsWith("https://") === true,
            sameSite: "lax" as const,
            path: "/",
            maxAge: SESSION_MAX_AGE,
        },
    };
}

function isTokenExpired(accessToken: string, bufferSeconds = 60): boolean {
    try {
        const parts = accessToken.split(".");
        if (parts.length !== 3) return false;
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(b64));
        if (!payload.exp) return false;
        return payload.exp - bufferSeconds < Date.now() / 1000;
    } catch {
        return false;
    }
}

export async function ensureValidSession(
    token: JWT
): Promise<{ encodedCookie: string } | null | { error: true }> {
    const accessToken = token.accessToken as string | undefined;
    const refreshTokenValue = token.refreshToken as string | undefined;

    if (!accessToken || !refreshTokenValue) return { error: true };

    // Fast local check - skip network call when the token is still valid
    if (!isTokenExpired(accessToken)) return null;

    try {
        const newTokens = await refreshToken(refreshTokenValue);
        console.log("newTokens__________", newTokens);
        if (!newTokens?.accessToken) return { error: true };
        const encodedCookie = await encodeSessionCookie(token, newTokens);
        return { encodedCookie };
    } catch (error) {
        console.error("ensureValidSession refresh failed:", error);
        return { error: true };
    }
}
