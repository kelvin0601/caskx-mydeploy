import { env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import { OptionNextAuth } from "@/config/auth";
import { getServerSession } from "next-auth";
import { encode } from "next-auth/jwt";
import { ROUTE_AUTH } from "@/lib/constants";
import { getSessionCookieName } from "@/lib/constants/auth";

export async function POST(req: NextRequest) {
    try {
        const { accessToken } = await req.json();

        if (!accessToken) {
            return NextResponse.json(
                { message: "accessToken is required" },
                { status: 400 }
            );
        }

        const sessionCookie = getSessionCookieName();
        const session = await getServerSession(OptionNextAuth());

        if (!session) {
            NextResponse.redirect(new URL(ROUTE_AUTH.LOGIN, req.url));
        }

        const newSessionToken = await encode({
            secret: env.nextAuthSecret!,
            token: {
                ...session,
                user: {
                    ...session?.user,
                    accessToken,
                },
            },
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        const response = NextResponse.json(
            {
                message: "Session updated successfully",
                accessToken,
            },
            { status: 200 }
        );

        response.cookies.set(sessionCookie, newSessionToken, {
            httpOnly: true,
            secure: env.isProduction || env.nextAuthUrl.startsWith("https://"),
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        return response;
    } catch (error) {
        console.error("[update-session] Error updating session", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
