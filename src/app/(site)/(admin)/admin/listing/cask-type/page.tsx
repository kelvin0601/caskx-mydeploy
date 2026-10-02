import { PAGE_METADATA } from "@/lib/constants/metadata";
import ListingCaskTypeModule from "@/modules/dashboard/listing-cask-type";
import React from "react";

export const metadata = PAGE_METADATA.ADMIN_LISTING_CASK_TYPE;

export default function ListingCaskTypePage() {
    return <ListingCaskTypeModule />;
}
