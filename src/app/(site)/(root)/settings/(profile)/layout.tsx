import SettingLayout from "@/layouts/SettingsLayout";
import React from "react";

export default function SettingsLayoutProfile({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SettingLayout>{children}</SettingLayout>;
}
