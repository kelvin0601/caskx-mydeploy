import "@/assets/styles/globals.css";
import MainLayout from "@/layouts/MainLayout/MainLayout";
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/lib/constants";
import { coda, inter, reckless, workSans } from "@/lib/constants/font";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    title: {
        template: `%s | ${APP_NAME}`,
        default: APP_NAME,
    },
    description: APP_DESCRIPTION,
    metadataBase: new URL(SERVER_URL),
};
export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#110f0d" },
        { media: "(prefers-color-scheme: dark)", color: "#110f0d" },
    ],
};

export default function SiteRootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={` ${workSans.variable} ${inter.variable} ${coda.variable} ${reckless.variable} font-inter antialiased`}
            >
                <MainLayout>{children}</MainLayout>
            </body>
        </html>
    );
}
