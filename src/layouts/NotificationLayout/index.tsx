import React from "react";
import NotificationMenu from "./menu-notification";
import BaseSidebarLayout from "../SidebarLayout";

export default function NotificationLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <BaseSidebarLayout
            relative
            containerClassName="tb:px-0 mb:px-0"
            sidebarContainerClassName="bg-bg-main transition-all duration-150 tb:border-b tb:border-bd-main"
            contentContainerClassName="tb:min-h-[calc(100vh-var(--height-header)-4rem)] tb:pb-5"
            sidebar={<NotificationMenu />}
        >
            {children}
        </BaseSidebarLayout>
    );
}
