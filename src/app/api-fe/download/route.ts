import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
        return NextResponse.json(
            { error: "URL is required" },
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
    const response = await fetch(url);
    const blob = await response.blob();

    return new Response(blob, {
        headers: {
            "Content-Type": blob.type,
            "Content-Disposition": `attachment; filename="${url.split("/").pop()}"`,
            "Cache-Control": "no-store",
        },
    });
}
