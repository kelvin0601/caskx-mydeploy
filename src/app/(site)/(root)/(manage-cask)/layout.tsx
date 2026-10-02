import ManageCaskProvider from "@/modules/mange-cask";
import React from "react";

export default function ManageCaskLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ManageCaskProvider>{children}</ManageCaskProvider>;
}
