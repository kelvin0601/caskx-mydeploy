import { PAGE_METADATA } from "@/lib/constants/metadata";
import ListingClassificationModule from "@/modules/dashboard/listing-classification";
import React from "react";

export const metadata = PAGE_METADATA.ADMIN_LISTING_CLASSIFICATION;

export default function ListingClassificationPage() {
    return <ListingClassificationModule />;
}
