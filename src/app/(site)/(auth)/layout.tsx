import AuthLayout from "@/layouts/AuthLayout";
import { Viewport } from "next";

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#FFFCF6" },
        { media: "(prefers-color-scheme: dark)", color: "#FFFCF6" },
    ],
};

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AuthLayout>{children}</AuthLayout>;
}
