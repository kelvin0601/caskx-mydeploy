import { Metadata } from "next";
import ProfileListingsModule from "@/modules/profile/listings";

export const metadata: Metadata = {
    title: "Profile - Listings",
    description: "Manage your cask listings on Cask Exchange",
};

export default function ProfileListingsPage() {
    return <ProfileListingsModule />;
}
