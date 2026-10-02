import { PAGE_METADATA } from "@/lib/constants/metadata";
import React from "react";

export const metadata = PAGE_METADATA.ADMIN_ORDERS_DOCUMENTS;

export default function DocumentsPage() {
    return (
        <div>
            <h1>Documents</h1>
            <p>View and download order-related documents.</p>
        </div>
    );
}
