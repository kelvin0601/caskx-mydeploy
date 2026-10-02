import type { Viewport } from "next";

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#FFFCF6" },
        { media: "(prefers-color-scheme: dark)", color: "#FFFCF6" },
    ],
};

export default function EmptyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="min-h-screen w-full bg-white-main">{children}</div>;
}
