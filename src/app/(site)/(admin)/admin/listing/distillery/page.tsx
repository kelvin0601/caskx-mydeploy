import { PAGE_METADATA } from "@/lib/constants/metadata";
import ListingDistilleryModule from "@/modules/dashboard/listing-distillery";
import React from "react";

export const metadata = PAGE_METADATA.ADMIN_LISTING_DISTILLERY;

export default function ListingDistilleryPage() {
    return <ListingDistilleryModule />;
}
