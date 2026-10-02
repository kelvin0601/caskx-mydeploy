import { PAGE_METADATA } from "@/lib/constants/metadata";
import SellingModule from "@/modules/mange-cask/selling";
import React from "react";

export const metadata = PAGE_METADATA.SELLING_ASKS;

export default function PageSelling() {
    return <SellingModule />;
}
