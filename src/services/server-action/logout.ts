"use server";
import { ROUTE_AUTH } from "@/lib/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authServerAction } from "./auth";
import { getSessionCookieName } from "@/lib/constants/auth";

export async function logoutServerAction() {
    try {
        await authServerAction.signOut(true);
    } catch (error) {
        console.error("[LogoutServerAction] Backend signout failed:", error);
    }

    const cookieStore = await cookies();
    const sessionToken = getSessionCookieName();

    cookieStore.delete(sessionToken);
    cookieStore.delete("next-auth.callback-url");
    cookieStore.delete("next-auth.csrf-token");

    // Handle potential custom session cookies if any

    // 3. Redirect to login page
    redirect(ROUTE_AUTH.LOGIN);
}
