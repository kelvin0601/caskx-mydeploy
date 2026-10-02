import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { env } from "@/config/env";
import { isCmsUser } from "@/payload/access";

function isAllowedPreviewPath(path: string): boolean {
    try {
        const url = new URL(path, "http://payload-preview.local");
        return (
            url.origin === "http://payload-preview.local" &&
            (url.pathname === "/resources" ||
                url.pathname === "/resources/preview" ||
                url.pathname.startsWith("/resources/preview/"))
        );
    } catch {
        return false;
    }
}

export async function GET(request: Request) {
    if (!env.payloadCmsEnabled)
        return new Response("Not Found", { status: 404 });
    const url = new URL(request.url);
    const path = url.searchParams.get("path");
    if (!path || !isAllowedPreviewPath(path)) {
        return new Response("Invalid preview path", { status: 400 });
    }
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: request.headers });
    if (!isCmsUser(user))
        return new Response("You are not allowed to preview this resource", {
            status: 403,
        });
    (await draftMode()).enable();
    redirect(path);
}
