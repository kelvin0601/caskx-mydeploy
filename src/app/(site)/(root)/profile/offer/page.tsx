import { Metadata } from "next";
import ProfileOfferModule from "@/modules/profile/offer";
import React from "react";

export const metadata: Metadata = {
    title: "Profile - Offers",
    description:
        "Track your marketplace offers, matching progress and activity on Cask Exchange",
};

export default function ProfileOfferPage() {
    return <ProfileOfferModule />;
}
