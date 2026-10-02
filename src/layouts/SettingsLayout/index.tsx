import React from "react";
import MenuSettings from "./menu-settings";
import BaseSidebarLayout from "../SidebarLayout";

export default function SettingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <BaseSidebarLayout sidebar={<MenuSettings />}>
            {children}
        </BaseSidebarLayout>
    );
}
