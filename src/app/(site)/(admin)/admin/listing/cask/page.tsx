import { PAGE_METADATA } from "@/lib/constants/metadata";
import ListingCaskModule from "@/modules/dashboard/listing-cask";

export const metadata = PAGE_METADATA.ADMIN_LISTING_CASK;

export default function ListingCaskPage() {
    return <ListingCaskModule />;
}
