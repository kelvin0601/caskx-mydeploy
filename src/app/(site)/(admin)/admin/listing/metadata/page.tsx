import { PAGE_METADATA } from "@/lib/constants/metadata";
import MetadataManagementModule from "@/modules/dashboard/metadata-management";
import React from "react";

export const metadata = PAGE_METADATA.ADMIN_METADATA_MANAGEMENT;

export default function MetadataManagementPage() {
    return <MetadataManagementModule />;
}
