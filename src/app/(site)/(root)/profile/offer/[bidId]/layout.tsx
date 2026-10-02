import OfferDetailLayout from "@/layouts/OfferDetailLayout";
import React from "react";

export default function OfferDetailRouteLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <OfferDetailLayout>{children}</OfferDetailLayout>;
}
