import { CaskVariantsProvider } from "@/store/dashboard/CaskProvider";
import React from "react";

export default function CaskAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CaskVariantsProvider>{children}</CaskVariantsProvider>;
}
