import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(
            "https://www.ttb.gov/media/81066/download?inline",
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Accept-Encoding": "gzip, deflate, br",
                },
            }
        );
        const data = await response.blob();

        return new NextResponse(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        return new NextResponse(
            JSON.stringify({ error: "Failed to fetch data" }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
}
