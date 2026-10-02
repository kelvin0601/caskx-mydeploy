import { PAGE_METADATA } from "@/lib/constants/metadata";
import { EmbeddedComponentWrapper } from "@/providers/EmbeddedComponentWrapper";
import type { Viewport } from "next";
import React from "react";

export const metadata = PAGE_METADATA.ONBOARDING;

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#FFFCF6" },
        { media: "(prefers-color-scheme: dark)", color: "#FFFCF6" },
    ],
};

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <EmbeddedComponentWrapper>{children}</EmbeddedComponentWrapper>;
}
