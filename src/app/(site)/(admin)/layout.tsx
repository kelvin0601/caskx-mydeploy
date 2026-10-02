import DashboardLayout from "@/layouts/DashboardLayout";
import { Viewport } from "next";
import React from "react";

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#FFFCF6" },
        { media: "(prefers-color-scheme: dark)", color: "#FFFCF6" },
    ],
};

export default function DashboardLayoutRoot({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
