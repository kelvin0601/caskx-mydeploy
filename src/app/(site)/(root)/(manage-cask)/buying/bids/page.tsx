import { PAGE_METADATA } from "@/lib/constants/metadata";
import BuyingModule from "@/modules/mange-cask/buying";
import React from "react";

export const metadata = PAGE_METADATA.BUYING_BIDS;

const BuyingPage = () => {
    return <BuyingModule />;
};

export default BuyingPage;
